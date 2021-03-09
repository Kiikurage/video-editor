import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useRef } from 'react';
import { Container, CustomPIXIComponent } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { isResizable } from '../../model/objects/ResizableObejct';
import { AppController } from '../../service/AppController';
import { SnapPoint2DService } from '../../service/SnapPoint2DService';
import { useAppController } from '../AppControllerProvider';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { FocusArea } from './FocusArea';
import { usePreviewCanvasViewportInfo } from './PreviewPlayer';
import { Resizer } from './Resizer';

function useSnapPointService(appController: AppController): SnapPoint2DService {
    const ref = useRef<SnapPoint2DService>(null as never);
    if (ref.current === null) {
        ref.current = new SnapPoint2DService(appController);
    }
    return ref.current;
}

interface DragInfo {
    status: 'start' | 'move' | 'end';
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    dirX: -1 | 0 | 1;
    dirY: -1 | 0 | 1;
}

interface ResizeInfo {
    dx: number;
    dy: number;
    dw: number;
    dh: number;
}

interface Line {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

export function PreviewPlayerControlLayer(): React.ReactElement {
    const appController = useAppController();

    const { left: canvasLeft, top: canvasTop, scale: canvasScale } = usePreviewCanvasViewportInfo();
    const snapPointService = useSnapPointService(appController);
    const forceUpdate = useForceUpdate();
    const dragInfoRef = useRef<DragInfo>({ startX: 0, startY: 0, lastX: 0, lastY: 0, dirX: 0, dirY: 0, status: 'end' });
    const resizeInfoRef = useRef<ResizeInfo>({ dx: 0, dy: 0, dw: 0, dh: 0 });
    const guidelinesRef = useRef<Line[]>([]);
    const flagInteractionToRemoveObjectFromSelection = useRef<boolean>(false);

    const onObjectViewMouseDown = useCallbackRef((ev: PIXI.InteractionEvent, objectId: string) => {
        ev.data.originalEvent.preventDefault();
        const isObjectSelected = appController.selectedObjectIds.has(objectId);
        const isShiftKeyPressed = ev.data.originalEvent.shiftKey;
        appController.pause();

        if (isObjectSelected && isShiftKeyPressed) {
            flagInteractionToRemoveObjectFromSelection.current = true;
        } else if (!isObjectSelected && !isShiftKeyPressed) {
            appController.setSelectedObjects([objectId]);
            onResizerMouseDown(ev, 0, 0);
        } else {
            appController.addObjectToSelection(objectId);
            onResizerMouseDown(ev, 0, 0);
        }
    });

    const onObjectViewMouseUp = useCallbackRef((ev: PIXI.InteractionEvent, objectId: string) => {
        ev.data.originalEvent.preventDefault();
        const isObjectSelected = appController.selectedObjectIds.has(objectId);
        const isShiftKeyPressed = ev.data.originalEvent.shiftKey;

        if (
            isObjectSelected &&
            isShiftKeyPressed &&
            flagInteractionToRemoveObjectFromSelection.current &&
            resizeInfoRef.current !== null &&
            resizeInfoRef.current.dx === 0 &&
            resizeInfoRef.current.dy === 0
        ) {
            appController.removeObjectFromSelection(objectId);
        }

        onContainerMouseUp(ev);
        flagInteractionToRemoveObjectFromSelection.current = false;
    });

    const onObjectViewChange = useCallbackRef((dx: number, dy: number, dw: number, dh: number) => {
        const timeInMS = appController.currentTimeInMS;
        appController.modifySelectedObjects((obj) => {
            if (obj.locked) return null;
            if (!isResizable(obj)) return null;
            if (!appController.selectedObjects.has(obj)) return null;

            const frame = obj.getFrame(timeInMS);
            if (frame.width === 0 && frame.height === 0) return null;

            const newFrameTiming = Math.min(
                Math.max(0, (appController.currentTimeInMS - obj.startInMS) / (obj.endInMS - obj.startInMS)),
                1
            );

            return obj.clone({
                x: AnimatableValue.set(obj.x, newFrameTiming, frame.x + dx),
                y: AnimatableValue.set(obj.y, newFrameTiming, frame.y + dy),
                width: AnimatableValue.set(obj.width, newFrameTiming, frame.width + dw),
                height: AnimatableValue.set(obj.height, newFrameTiming, frame.height + dh),
            });
        });
    });

    const onResizing = useCallbackRef(() => {
        const selectionBox = appController.getSelectionBox();
        const { status, dirX, dirY, lastX, lastY, startX, startY } = dragInfoRef.current;
        if (status === 'start') {
            appController.pause();
        }
        if (selectionBox === null) return;

        const snapPointXs: number[] = [];
        const snapPointYs: number[] = [];
        let dragDx = (lastX - startX) / canvasScale;
        let dragDy = (lastY - startY) / canvasScale;

        const snapX1 = snapPointService.checkX(selectionBox.x + dragDx, 10 / canvasScale);
        if (snapX1 !== null) {
            snapPointXs.push(snapX1);
            dragDx = snapX1 - selectionBox.x;
        }

        const snapX2 = snapPointService.checkX(selectionBox.x + selectionBox.width + dragDx, 10 / canvasScale);
        if (snapX2 !== null) {
            snapPointXs.push(snapX2);
            dragDx = snapX2 - (selectionBox.x + selectionBox.width);
        }

        const snapY1 = snapPointService.checkY(selectionBox.y + dragDy, 10 / canvasScale);
        if (snapY1 !== null) {
            snapPointYs.push(snapY1);
            dragDy = snapY1 - selectionBox.y;
        }

        const snapY2 = snapPointService.checkY(selectionBox.y + selectionBox.height + dragDy, 10 / canvasScale);
        if (snapY2 !== null) {
            snapPointYs.push(snapY2);
            dragDy = snapY2 - (selectionBox.y + selectionBox.height);
        }

        const dw = dragDx * dirX;
        const dh = dragDy * dirY;
        const dx = dirX === -1 || (dirX === 0 && dirY === 0) ? dragDx : 0;
        const dy = dirY === -1 || (dirX === 0 && dirY === 0) ? dragDy : 0;

        if (status === 'end') {
            onObjectViewChange(dx, dy, dw, dh);
            resizeInfoRef.current = { dx: 0, dy: 0, dw: 0, dh: 0 };
            guidelinesRef.current = [];
        } else {
            const nonSelectedFrames = appController.getNonSelectedFrames();
            const guidelines: Line[] = [];
            for (const snapPointX of snapPointXs) {
                const objectIds = snapPointService.getObjectsAtX(snapPointX);
                const guideLineYs = [selectionBox.y + dy, selectionBox.y + selectionBox.height + dy + dh];
                for (const frame of nonSelectedFrames) {
                    if (!objectIds.has(frame.id)) continue;
                    guideLineYs.push(frame.y, frame.y + frame.height);
                }
                if (objectIds.has('viewport')) {
                    guideLineYs.push(0, appController.project.viewport.height);
                }
                guidelines.push({
                    x0: snapPointX,
                    y0: Math.min(...guideLineYs),
                    x1: snapPointX,
                    y1: Math.max(...guideLineYs),
                });
            }
            for (const snapPointY of snapPointYs) {
                const objectIds = snapPointService.getObjectsAtY(snapPointY);
                const guideLineXs = [selectionBox.x + dx, selectionBox.x + selectionBox.width + dx + dw];
                for (const frame of nonSelectedFrames) {
                    if (!objectIds.has(frame.id)) continue;
                    guideLineXs.push(frame.x, frame.x + frame.width);
                }
                if (objectIds.has('viewport')) {
                    guideLineXs.push(0, appController.project.viewport.width);
                }
                guidelines.push({
                    x0: Math.min(...guideLineXs),
                    y0: snapPointY,
                    x1: Math.max(...guideLineXs),
                    y1: snapPointY,
                });
            }

            guidelinesRef.current = guidelines;
            resizeInfoRef.current = { dx, dy, dw, dh };
        }
        forceUpdate();
    });

    const onResizerMouseDown = useCallbackRef((ev: PIXI.InteractionEvent, dirX: -1 | 0 | 1, dirY: -1 | 0 | 1) => {
        if (dragInfoRef.current.status !== 'end') return;

        ev.stopPropagation();
        ev.data.originalEvent.preventDefault();

        dragInfoRef.current.status = 'start';
        dragInfoRef.current.startX = (ev.data.originalEvent as MouseEvent).offsetX;
        dragInfoRef.current.startY = (ev.data.originalEvent as MouseEvent).offsetY;
        dragInfoRef.current.lastX = (ev.data.originalEvent as MouseEvent).offsetX;
        dragInfoRef.current.lastY = (ev.data.originalEvent as MouseEvent).offsetY;
        dragInfoRef.current.dirX = dirX;
        dragInfoRef.current.dirY = dirY;
        onResizing();
    });

    const onContainerMouseMove = useCallbackRef((ev: PIXI.InteractionEvent) => {
        if (dragInfoRef.current.status === 'end') return;

        dragInfoRef.current.status = 'move';
        dragInfoRef.current.lastX = (ev.data.originalEvent as MouseEvent).offsetX;
        dragInfoRef.current.lastY = (ev.data.originalEvent as MouseEvent).offsetY;
        onResizing();
    });

    const onContainerMouseUp = useCallbackRef((ev: PIXI.InteractionEvent) => {
        if (dragInfoRef.current.status === 'end') return;

        dragInfoRef.current.status = 'end';
        dragInfoRef.current.lastX = (ev.data.originalEvent as MouseEvent).offsetX;
        dragInfoRef.current.lastY = (ev.data.originalEvent as MouseEvent).offsetY;
        onResizing();
    });

    const nonSelectedFrames = appController.getNonSelectedFrames();
    const selectedFrames = appController.getSelectedFrames();
    const selectionBox = appController.getSelectionBox();
    return (
        <Container
            x={-canvasLeft * canvasScale}
            y={-canvasTop * canvasScale}
            interactive
            mousemove={onContainerMouseMove}
            mouseup={onContainerMouseUp}
            mouseupoutside={onContainerMouseUp}
        >
            <Container>
                {nonSelectedFrames.map((frame) => (
                    <FocusArea
                        key={frame.id}
                        id={frame.id}
                        x={frame.x * canvasScale}
                        y={frame.y * canvasScale}
                        width={frame.width * canvasScale}
                        height={frame.height * canvasScale}
                        selected={false}
                        onMouseDown={onObjectViewMouseDown}
                        onMouseUp={onObjectViewMouseUp}
                    />
                ))}
                {selectedFrames.map((frame) => (
                    <FocusArea
                        key={frame.id}
                        id={frame.id}
                        x={frame.x * canvasScale}
                        y={frame.y * canvasScale}
                        width={frame.width * canvasScale}
                        height={frame.height * canvasScale}
                        selected={true}
                        onMouseDown={onObjectViewMouseDown}
                        onMouseUp={onObjectViewMouseUp}
                    />
                ))}
            </Container>
            {selectionBox !== null && (
                <Resizer
                    key="resizer"
                    x={(selectionBox.x + resizeInfoRef.current.dx) * canvasScale}
                    y={(selectionBox.y + resizeInfoRef.current.dy) * canvasScale}
                    width={(selectionBox.width + resizeInfoRef.current.dw) * canvasScale}
                    height={(selectionBox.height + resizeInfoRef.current.dh) * canvasScale}
                    onMouseDown={onResizerMouseDown}
                />
            )}
            {guidelinesRef.current.map(({ x0, y0, x1, y1 }, i) => (
                <Guideline key={i} x0={x0 * canvasScale} y0={y0 * canvasScale} x1={x1 * canvasScale} y1={y1 * canvasScale} />
            ))}
        </Container>
    );
}

interface PixiProps {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

function applyProps(base: PIXI.Graphics, props: PixiProps) {
    const { x0, y0, x1, y1 } = props;

    base.clear();
    base.lineStyle(1, 0xff0000);
    base.moveTo(x0, y0);
    base.lineTo(x1, y1);
}

export const Guideline = CustomPIXIComponent(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Graphics();

            applyProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);
        },
    },
    'Guideline'
);
