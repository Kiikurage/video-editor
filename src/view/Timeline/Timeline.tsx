import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Project } from '../../model/Project';
import { useAppController } from '../AppControllerProvider';
import { CustomStage } from '../CustomStage';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { TimelineContent } from './TimelineContent';

const Base = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    transform: translateX(0);
`;

const options: PIXI.ApplicationOptions = {
    backgroundColor: 0xffffff,
    width: 800,
    height: 200,
    autoDensity: true,
    resolution: devicePixelRatio,
    antialias: false,
};

interface ViewportInfo {
    pixelPerMS: number;
    top: number;
    leftInMS: number;
}

export function Timeline(): React.ReactElement {
    const appController = useAppController();

    const forceUpdate = useForceUpdate();
    const { info, setContainer, setWidthInMS } = useViewportInfo();

    const onProjectOpen = useCallbackRef((newProject: Project) => {
        setWidthInMS(Math.max(Project.computeDurationInMS(newProject), 1000));
    });

    useEffect(() => {
        appController.on('open', onProjectOpen);
        appController.on('change', forceUpdate);
        appController.on('selectionchange', forceUpdate);
        appController.on('seek', forceUpdate);
        appController.on('tick', forceUpdate);

        return () => {
            appController.off('open', onProjectOpen);
            appController.off('change', forceUpdate);
            appController.off('selectionchange', forceUpdate);
            appController.off('seek', forceUpdate);
            appController.off('tick', forceUpdate);
        };
    }, [appController, forceUpdate, onProjectOpen]);

    return (
        <Base ref={setContainer}>
            <CustomStage options={options}>
                <TimelineCanvasViewportInfo.Provider value={info}>
                    <TimelineContent objects={appController.project.objects} />
                </TimelineCanvasViewportInfo.Provider>
            </CustomStage>
        </Base>
    );
}

function useViewportInfo(): {
    info: ViewportInfo;
    setContainer: (container: HTMLElement | null) => void;
    setWidthInMS: (durationInMS: number) => void;
} {
    const forceUpdate = useForceUpdate();

    const baseRef = useRef<HTMLElement | null>(null);

    const info = useRef<ViewportInfo>({
        pixelPerMS: 50 / 1000,
        leftInMS: 0,
        top: 0,
    });

    const onWheel = useCallbackRef((ev: WheelEvent) => {
        ev.stopPropagation();

        if (ev.ctrlKey) {
            const MIN_SCALE = Math.log2(100 / (10 * 60 * 1000)); // 10[px/min]
            const MAX_SCALE = Math.log2(300 / 1000); // 300[px/1sec]

            const oldScale = info.current.pixelPerMS;
            const oldScaleInLogScale = Math.log2(oldScale);
            const newScaleInLogScale = Math.min(Math.max(MIN_SCALE, oldScaleInLogScale - ev.deltaY / 100), MAX_SCALE);
            const newScale = 2 ** newScaleInLogScale;

            info.current.pixelPerMS = newScale;

            const scaleDiff = (newScale - oldScale) / (newScale * oldScale);
            info.current.leftInMS += scaleDiff * ev.offsetX;
        } else {
            info.current.leftInMS += ev.deltaX / info.current.pixelPerMS;
            info.current.top += ev.deltaY;
        }

        info.current.leftInMS = Math.max(-100 / info.current.pixelPerMS, info.current.leftInMS);
        info.current.top = Math.max(-10, info.current.top);

        forceUpdate();
    });

    const setContainer = useCallbackRef((base: HTMLElement | null) => {
        baseRef.current = base;

        if (base === null) return;

        base?.addEventListener('wheel', onWheel, { passive: false });

        info.current.leftInMS = -100 / info.current.pixelPerMS;
        info.current.top = 0;

        forceUpdate();
    });

    const setWidthInMS = useCallbackRef((durationInMS: number) => {
        const bcr = baseRef.current?.getBoundingClientRect();
        info.current.pixelPerMS = (bcr?.width ?? 1) / durationInMS;
        info.current.leftInMS = -100 / info.current.pixelPerMS;
        info.current.top = 0;

        forceUpdate();
    });

    return { info: { ...info.current }, setContainer, setWidthInMS };
}

export interface TimelineCanvasViewportInfo {
    pixelPerMS: number;
    leftInMS: number;
    top: number;
}

const TimelineCanvasViewportInfo = React.createContext<TimelineCanvasViewportInfo>({
    pixelPerMS: 1,
    leftInMS: -100,
    top: 0,
});

export function useTimelineCanvasViewportInfo(): TimelineCanvasViewportInfo {
    return useContext(TimelineCanvasViewportInfo);
}
