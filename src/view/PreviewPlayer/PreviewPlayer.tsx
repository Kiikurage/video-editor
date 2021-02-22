import * as PIXI from 'pixi.js';
import * as React from 'react';
import { ComponentType, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { AudioObject } from '../../model/objects/AudioObject';
import { BaseObject } from '../../model/objects/BaseObject';
import { ImageObject } from '../../model/objects/ImageObject';
import { ShapeObject } from '../../model/objects/ShapeObject';
import { TextObject } from '../../model/objects/TextObject';
import { VideoObject } from '../../model/objects/VideoObject';
import { Project } from '../../model/Project';
import { useAppController } from '../AppControllerProvider';
import { CustomStage } from '../CustomStage';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { AudioObjectView } from './AudioObjectView';
import { Background } from './Background';
import { ImageObjectView } from './ImageObjectView';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';
import { ResizableObject } from './ResizeView/ResizableObejct';
import { ShapeObjectView } from './ShapeObjectView';
import { TextObjectView } from './TextObjectView';
import { VideoObjectView } from './VideoObjectView';

const Base = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: auto;
`;

const options: PIXI.ApplicationOptions = {
    width: 300,
    height: 300,
    transparent: true,
    antialias: true,
};

const ObjectViewMap: Record<string, ComponentType<PreviewPlayerObjectViewProps<never>>> = {
    [VideoObject.type]: VideoObjectView,
    [TextObject.type]: TextObjectView,
    [ImageObject.type]: ImageObjectView,
    [ShapeObject.type]: ShapeObjectView,
    [AudioObject.type]: AudioObjectView,
};

export function PreviewPlayer(): React.ReactElement {
    const appController = useAppController();
    const { previewController, project } = appController;
    const [info, setContainer] = useViewportInfo(project);
    const forceUpdate = useForceUpdate();

    useEffect(() => {
        appController.on('project.change', forceUpdate);
        appController.on('object.select', forceUpdate);

        return () => {
            appController.off('project.change', forceUpdate);
            appController.off('object.select', forceUpdate);
        };
    }, [appController, forceUpdate]);

    useEffect(() => {
        previewController.on('seek', forceUpdate);
        previewController.on('tick', forceUpdate);

        return () => {
            previewController.off('seek', forceUpdate);
            previewController.off('tick', forceUpdate);
        };
    }, [previewController, forceUpdate]);

    const activeObjects = project.objects.filter(
        (object) => object.startInMS <= previewController.currentTimeInMS && previewController.currentTimeInMS <= object.endInMS
    );

    const onObjectViewChange = useCallbackRef((object: ResizableObject, dx: number, dy: number, dw: number, dh: number) => {
        appController.commitHistory(() => {
            const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, previewController.currentTimeInMS);
            const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, previewController.currentTimeInMS);
            const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, previewController.currentTimeInMS);
            const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, previewController.currentTimeInMS);

            const newFrameTiming = Math.min(
                Math.max(0, (previewController.currentTimeInMS - object.startInMS) / (object.endInMS - object.startInMS)),
                1
            );

            appController.updateObject({
                ...object,
                x: AnimatableValue.set(object.x, newFrameTiming, x + dx),
                y: AnimatableValue.set(object.y, newFrameTiming, y + dy),
                width: AnimatableValue.set(object.width, newFrameTiming, width + dw),
                height: AnimatableValue.set(object.height, newFrameTiming, height + dh),
            } as ShapeObject);
        });
    });

    const onObjectViewSelect = useCallbackRef((ev: PIXI.InteractionEvent, object: BaseObject) => {
        ev.stopPropagation();
        ev.data.originalEvent.preventDefault();
        if (ev.data.originalEvent.shiftKey) {
            appController.addObjectToSelection(object.id);
        } else {
            appController.setSelectedObjects([object.id]);
        }
    });

    const onStageMouseDown = useCallbackRef(() => {
        appController.setSelectedObjects([]);
    });

    function renderObjectView(object: BaseObject): React.ReactNode {
        const Renderer = ObjectViewMap[object.type];

        if (Renderer === undefined) {
            console.warn(`Unknown object type: ${object.type}`);
        } else {
            return (
                <Renderer
                    key={object.id}
                    object={object as never}
                    selected={appController.selectedObjectIds.has(object.id)}
                    previewController={previewController}
                    onChange={(dx, dy, dw, dh) => onObjectViewChange(object as ResizableObject, dx, dy, dw, dh)}
                    onSelect={(ev) => onObjectViewSelect(ev, object)}
                />
            );
        }
    }

    return (
        <Base ref={setContainer} onClick={(ev) => ev.nativeEvent}>
            <CustomStage options={options} onMouseDown={onStageMouseDown}>
                <PreviewCanvasViewportInfo.Provider value={info}>
                    <Background project={project} />
                    {activeObjects.map(renderObjectView)}
                </PreviewCanvasViewportInfo.Provider>
            </CustomStage>
        </Base>
    );
}

function useViewportInfo(project: Project): [info: PreviewCanvasViewportInfo, setContainer: (container: HTMLElement | null) => void] {
    const forceUpdate = useForceUpdate();

    const baseRef = useRef<HTMLElement | null>(null);
    const info = useRef<PreviewCanvasViewportInfo>({ scale: 0.1, top: 0, left: 0 });

    const PADDING = 16 * 2;

    const onWheel = useCallbackRef((ev: WheelEvent) => {
        ev.stopPropagation();

        if (ev.ctrlKey) {
            const MIN_SCALE = Math.log2(0.1);
            const MAX_SCALE = Math.log2(2);

            const oldScale = info.current.scale;
            const oldScaleInLogScale = Math.log2(oldScale);
            const newScaleInLogScale = Math.min(Math.max(MIN_SCALE, oldScaleInLogScale - ev.deltaY / 100), MAX_SCALE);
            const newScale = 2 ** newScaleInLogScale;

            info.current.scale = newScale;
            info.current.left += ev.offsetX / oldScale - ev.offsetX / newScale;
            info.current.top += ev.offsetY / oldScale - ev.offsetY / newScale;
        } else {
            info.current.left += ev.deltaX / info.current.scale;
            info.current.top += ev.deltaY / info.current.scale;
        }

        if (baseRef.current) {
            const bcr = baseRef.current.getBoundingClientRect();
            info.current.left = Math.max(
                -bcr.width / info.current.scale + 2 * PADDING,
                Math.min(info.current.left, project.viewport.width - 2 * PADDING)
            );
            info.current.top = Math.max(
                -bcr.height / info.current.scale + 2 * PADDING,
                Math.min(info.current.top, project.viewport.height - 2 * PADDING)
            );
        }

        forceUpdate();
    });

    const setContainer = useCallbackRef((base: HTMLElement | null) => {
        baseRef.current = base;
        if (base) {
            base.addEventListener('wheel', onWheel, { passive: true });
            const bcr = base.getBoundingClientRect();

            const scale = Math.min((bcr.width - PADDING) / project.viewport.width, (bcr.height - PADDING) / project.viewport.height);
            const left = -(bcr.width / scale - project.viewport.width) / 2;
            const top = -(bcr.height / scale - project.viewport.height) / 2;

            info.current = { scale, left, top };

            const canvasWidth = project.viewport.width * info.current.scale + PADDING;
            const canvasHeight = project.viewport.height * info.current.scale + PADDING;
            info.current.left = Math.max(-canvasWidth + 2 * PADDING, Math.min(info.current.left, canvasWidth - 2 * PADDING));
            info.current.top = Math.max(-canvasHeight + 2 * PADDING, Math.min(info.current.top, canvasHeight - 2 * PADDING));

            forceUpdate();
        }
    });

    return [
        {
            left: info.current.left,
            top: info.current.top,
            scale: info.current.scale,
        },
        setContainer,
    ];
}

export interface PreviewCanvasViewportInfo {
    scale: number;
    left: number;
    top: number;
}

const PreviewCanvasViewportInfo = React.createContext<PreviewCanvasViewportInfo>({
    scale: 1,
    left: 0,
    top: 0,
});

export function usePreviewCanvasViewportInfo(): PreviewCanvasViewportInfo {
    return useContext(PreviewCanvasViewportInfo);
}
