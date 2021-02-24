import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { Container } from 'react-pixi-fiber';
import { Box } from '../../model/Box';
import { Frame } from '../../model/frame/Frame';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { isResizable } from '../../model/objects/ResizableObejct';
import { AppController } from '../../service/AppController';
import { SnapPointManager } from '../../service/SnapPointManager';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { FocusArea } from './FocusArea';
import { usePreviewCanvasViewportInfo } from './PreviewPlayer';
import { Resizer } from './Resizer';

interface ControlLayerProps {
    frames: Frame[];
    appController: AppController;
}

function useSnapPointManager(): SnapPointManager {
    const ref = useRef<SnapPointManager>(null as never);
    if (ref.current === null) {
        ref.current = new SnapPointManager();
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

export function PreviewPlayerControlLayer(props: ControlLayerProps): React.ReactElement {
    const { frames, appController } = props;
    const previewController = appController.previewController;

    const { left: canvasLeft, top: canvasTop, scale: canvasScale } = usePreviewCanvasViewportInfo();
    const xSnapPointManager = useSnapPointManager();
    const ySnapPointManager = useSnapPointManager();
    const forceUpdate = useForceUpdate();
    const dragInfoRef = useRef<DragInfo>({ startX: 0, startY: 0, lastX: 0, lastY: 0, dirX: 0, dirY: 0, status: 'end' });
    const resizeInfoRef = useRef<ResizeInfo>({ dx: 0, dy: 0, dw: 0, dh: 0 });
    const flagInteractionToRemoveObjectFromSelection = useRef<boolean>(false);

    const { selectedFrames, nonSelectedFrames } = useMemo(() => {
        const selectedFrames: Frame[] = [];
        const nonSelectedFrames: Frame[] = [];
        for (const frame of frames) {
            if (appController.selectedObjectIds.has(frame.id)) {
                selectedFrames.push(frame);
            } else {
                nonSelectedFrames.push(frame);
            }
        }

        return { selectedFrames, nonSelectedFrames };
    }, [appController.selectedObjectIds, frames]);

    useEffect(() => {
        if (!previewController.paused) return () => void 0;

        for (const frame of nonSelectedFrames) {
            if (frame.width === 0 || frame.height === 0) continue;

            xSnapPointManager.add(frame.id, frame.x, frame.x + frame.width);
            ySnapPointManager.add(frame.id, frame.y, frame.y + frame.height);
        }

        return () => {
            for (const frame of nonSelectedFrames) {
                xSnapPointManager.delete(frame.id);
                ySnapPointManager.delete(frame.id);
            }
        };
    }, [nonSelectedFrames, previewController.paused, xSnapPointManager, ySnapPointManager]);

    useEffect(() => {
        xSnapPointManager.add('viewport', 0, appController.project.viewport.width);
        ySnapPointManager.add('viewport', 0, appController.project.viewport.height);

        return () => {
            xSnapPointManager.delete('viewport');
            ySnapPointManager.delete('viewport');
        };
    }, [appController.project.viewport.height, appController.project.viewport.width, xSnapPointManager, ySnapPointManager]);

    const selectionBox = useMemo<Box | null>(() => {
        if (selectedFrames.length === 0) return null;

        const x1 = Math.min(...selectedFrames.map((frame) => frame.x));
        const y1 = Math.min(...selectedFrames.map((frame) => frame.y));
        const x2 = Math.max(...selectedFrames.map((frame) => frame.x + frame.width));
        const y2 = Math.max(...selectedFrames.map((frame) => frame.y + frame.height));

        return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
    }, [selectedFrames]);

    const onObjectViewMouseDown = useCallbackRef((ev: PIXI.InteractionEvent, objectId: string) => {
        ev.data.originalEvent.preventDefault();
        const isObjectSelected = appController.selectedObjectIds.has(objectId);
        const isShiftKeyPressed = ev.data.originalEvent.shiftKey;
        appController.previewController.pause();

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
        const timeInMS = previewController.currentTimeInMS;
        appController.modifySelectedObjects((obj) => {
            if (obj.locked) return null;
            if (!isResizable(obj)) return null;
            if (!appController.selectedObjects.has(obj)) return null;

            const frame = obj.getFrame(timeInMS);
            if (frame.width === 0 && frame.height === 0) return null;

            const newFrameTiming = Math.min(
                Math.max(0, (previewController.currentTimeInMS - obj.startInMS) / (obj.endInMS - obj.startInMS)),
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
        const { status, dirX, dirY, lastX, lastY, startX, startY } = dragInfoRef.current;
        if (status === 'start') {
            appController.previewController.pause();
        }
        if (selectionBox === null) return;

        let dragDx = (lastX - startX) / canvasScale;
        let dragDy = (lastY - startY) / canvasScale;

        const snapX1 = xSnapPointManager.check(selectionBox.x + dragDx, 30);
        if (snapX1 !== null) dragDx = snapX1 - selectionBox.x;

        const snapX2 = xSnapPointManager.check(selectionBox.x + selectionBox.width + dragDx, 30);
        if (snapX2 !== null) dragDx = snapX2 - (selectionBox.x + selectionBox.width);

        const snapY1 = ySnapPointManager.check(selectionBox.y + dragDy, 30);
        if (snapY1 !== null) dragDy = snapY1 - selectionBox.y;

        const snapY2 = ySnapPointManager.check(selectionBox.y + selectionBox.height + dragDy, 30);
        if (snapY2 !== null) dragDy = snapY2 - (selectionBox.y + selectionBox.height);

        const dw = dragDx * dirX;
        const dh = dragDy * dirY;
        const dx = dirX === -1 || (dirX === 0 && dirY === 0) ? dragDx : 0;
        const dy = dirY === -1 || (dirX === 0 && dirY === 0) ? dragDy : 0;

        if (status === 'end') {
            onObjectViewChange(dx, dy, dw, dh);
            resizeInfoRef.current = { dx: 0, dy: 0, dw: 0, dh: 0 };
        } else {
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
        </Container>
    );
}
