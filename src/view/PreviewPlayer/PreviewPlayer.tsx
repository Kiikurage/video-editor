import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useContext, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Project } from '../../model/Project';
import { useAppController } from '../AppControllerProvider';
import { CustomStage } from '../CustomStage';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { Background } from './Background';
import { PreviewPlayerControlLayer } from './PreviewPlayerControlLayer';
import { PreviewPlayerObjectsLayer } from './PreviewPlayerObjectsLayer';

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

    const onStageMouseDown = useCallbackRef(() => {
        appController.setSelectedObjects([]);
    });

    const activeFrames = useMemo(() => {
        const timeInMS = previewController.currentTimeInMS;
        return appController.project.objects
            .filter((object) => object.startInMS <= timeInMS && timeInMS < object.endInMS)
            .map((object) => object.getFrame(timeInMS));
    }, [appController.project.objects, previewController.currentTimeInMS]);

    return (
        <Base ref={setContainer} onClick={(ev) => ev.nativeEvent}>
            <CustomStage options={options} onMouseDown={onStageMouseDown}>
                <PreviewCanvasViewportInfo.Provider value={info}>
                    <Background project={project} />
                    <PreviewPlayerObjectsLayer frames={activeFrames} appController={appController} />
                    <PreviewPlayerControlLayer frames={activeFrames} appController={appController} />
                </PreviewCanvasViewportInfo.Provider>
            </CustomStage>
        </Base>
    );
}

function useViewportInfo(project: Project): [info: PreviewCanvasViewportInfo, setContainer: (container: HTMLElement | null) => void] {
    const forceUpdate = useForceUpdate();

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

            const scaleDiff = (newScale - oldScale) / (newScale * oldScale);
            info.current.left += scaleDiff * ev.offsetX;
            info.current.top += scaleDiff * ev.offsetY;
        } else {
            info.current.left += ev.deltaX / info.current.scale;
            info.current.top += ev.deltaY / info.current.scale;
        }

        const bcr = (ev.target as HTMLElement).getBoundingClientRect();
        info.current.left = Math.max(
            -bcr.width / info.current.scale + 2 * PADDING,
            Math.min(info.current.left, project.viewport.width - 2 * PADDING)
        );
        info.current.top = Math.max(
            -bcr.height / info.current.scale + 2 * PADDING,
            Math.min(info.current.top, project.viewport.height - 2 * PADDING)
        );

        forceUpdate();
    });

    const setContainer = useCallbackRef((base: HTMLElement | null) => {
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

    return [{ ...info.current }, setContainer];
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
