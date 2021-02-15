import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { AudioObject } from '../../model/objects/AudioObject';
import { BaseObject } from '../../model/objects/BaseObject';
import { Box } from '../../model/objects/Box';
import { ImageObject } from '../../model/objects/ImageObject';
import { ShapeObject } from '../../model/objects/ShapeObject';
import { TextObject } from '../../model/objects/TextObject';
import { VideoObject } from '../../model/objects/VideoObject';
import { Project } from '../../model/Project';
import { useAppController } from '../AppControllerProvider';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { CustomStage } from '../CustomStage';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { MouseTimeIndicator } from './MouseTimeIndicator';
import { TimelineAudioObjectView } from './TimelineAudioObjectView';
import { TimelineBase } from './TimelineBase';
import { TimelineBaseObjectView, TimelineObjectViewProps } from './TimelineBaseObjectView';
import { TimelineImageObjectView } from './TimelineImageObjectView';
import { TimelineShapeObjectView } from './TimelineShapeObjectView';
import { TimelineTextObjectView } from './TimelineTextObjectView';
import { TimelineVideoObjectView } from './TimelineVideoObjectView';

const Base = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    background: #fff;
    transform: translateX(0);
`;

const ScrollWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow: auto auto;

    > canvas {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
`;

const options: PIXI.ApplicationOptions = {
    backgroundColor: 0xffffff,
    width: 800,
    height: 200,
    autoDensity: true,
    resolution: devicePixelRatio,
};

interface TimelineContext {
    pixelPerMS: number;
    leftInMS: number;
    rightInMS: number;
}

const TimelineContext = React.createContext<TimelineContext>({
    pixelPerMS: 1,
    leftInMS: 0,
    rightInMS: 1,
});

export function useTimelineContext(): TimelineContext {
    return useContext(TimelineContext);
}

interface TimelineNodeLayoutData {
    object: BaseObject;
    ComponentType: React.ComponentType<TimelineObjectViewProps>;
    rect: Box;
}

function useCanvasLayoutInfo(): {
    pixelPerMS: number;
    setPixelPerMS: (newVal: number) => void;
    setCanvasContainer: (container: HTMLElement | null) => void;
    leftInMS: number;
    rightInMS: number;
    top: number;
    width: number;
    height: number;
} {
    const forceUpdate = useForceUpdate();

    const [pixelPerMS, setPixelPerMS] = useState(50 / 1000); // 50[px/1sec]

    const canvasLayout = useRef<{ width: number; height: number; left: number; top: number }>({
        width: 1,
        height: 1,
        top: 0,
        left: 0,
    });

    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const onWheel = useCallbackRef((ev: WheelEvent) => {
        if (ev.ctrlKey) {
            ev.stopPropagation();
            ev.preventDefault();
            const MIN_SCALE_FACTOR = Math.log2(100 / (10 * 60 * 1000)); // 10[px/min]
            const MAX_SCALE_FACTOR = Math.log2(300 / 1000); // 300[px/1sec]
            const oldScale = Math.log2(pixelPerMS);
            const newScale = Math.min(Math.max(MIN_SCALE_FACTOR, oldScale - ev.deltaY / 100), MAX_SCALE_FACTOR);
            const newPixelPerMS = 2 ** newScale;

            setPixelPerMS(newPixelPerMS);
        }
    });

    const onScroll = useCallbackRef((ev: Event) => {
        canvasLayout.current.left = (ev.currentTarget as HTMLElement).scrollLeft;
        canvasLayout.current.top = (ev.currentTarget as HTMLElement).scrollTop;
        forceUpdate();
    });

    const setCanvasContainer = useCallbackRef((base: HTMLElement | null) => {
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
        }

        if (base === null) return;

        resizeObserverRef.current = new ResizeObserver((etntries) => {
            etntries.forEach((entry) => {
                canvasLayout.current.width = entry.contentRect.width;
                canvasLayout.current.height = entry.contentRect.height;
                forceUpdate();
            });
        });
        resizeObserverRef.current.observe(base);

        base?.addEventListener('wheel', onWheel, { passive: false });
        base?.addEventListener('scroll', onScroll, { passive: true });
    });

    return {
        pixelPerMS,
        setPixelPerMS,
        setCanvasContainer,
        leftInMS: canvasLayout.current.left / pixelPerMS,
        rightInMS: (canvasLayout.current.left + canvasLayout.current.width) / pixelPerMS,
        top: canvasLayout.current.top,
        width: canvasLayout.current.width,
        height: canvasLayout.current.height,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TimelineObjectViewComponentMap: Record<string, React.ComponentType<TimelineObjectViewProps<any>>> = {
    [TextObject.type]: TimelineTextObjectView,
    [ImageObject.type]: TimelineImageObjectView,
    [VideoObject.type]: TimelineVideoObjectView,
    [AudioObject.type]: TimelineAudioObjectView,
    [ShapeObject.type]: TimelineShapeObjectView,
};

export function TimeLine(): React.ReactElement {
    const appController = useAppController();

    const [mouseX, setMouseX] = useState(0);
    const forceUpdate = useForceUpdate();
    const {
        pixelPerMS,
        setPixelPerMS,
        setCanvasContainer,
        top: canvasTop,
        width: canvasWidth,
        height: canvasHeight,
        rightInMS,
        leftInMS,
    } = useCanvasLayoutInfo();

    const onProjectOpen = useCallbackRef((newProject: Project) => {
        setPixelPerMS(canvasWidth / Math.max(Project.computeDurationInMS(newProject), 1000));
    });

    const onMouseMove = useCallbackRef((ev: React.MouseEvent) => {
        setMouseX(ev.clientX);
    });

    const onTimelineBaseClick = useCallbackRef((ev: PIXI.InteractionEvent) => {
        ev.stopPropagation();
        appController.previewController.currentTimeInMS = ev.data.global.x / pixelPerMS + leftInMS;
        appController.selectObject(null);
    });

    const onTimelineObjectClick = useCallbackRef((ev: PIXI.InteractionEvent, object: BaseObject) => {
        ev.stopPropagation();
        appController.previewController.currentTimeInMS = ev.data.global.x / pixelPerMS + leftInMS;
        appController.selectObject(object.id);
    });

    const onTimelineObjectChange = useCallbackRef((object: BaseObject, newX: number, newWidth: number) => {
        appController.commitHistory(() => {
            appController.updateObject({
                ...object,
                startInMS: quantizeTime(newX / pixelPerMS + leftInMS, appController.project.fps),
                endInMS: quantizeTime((newX + newWidth) / pixelPerMS + leftInMS, appController.project.fps),
            });
        });
    });

    const onTimelineObjectKeyframeClick = useCallbackRef((ev: PIXI.InteractionEvent, object: BaseObject, keyframeTiming: number) => {
        ev.stopPropagation();
        appController.previewController.currentTimeInMS = object.startInMS + (object.endInMS - object.startInMS) * keyframeTiming;
        appController.selectObject(object.id);
    });

    useEffect(() => {
        appController.on('project.open', onProjectOpen);
        appController.on('project.change', forceUpdate);
        appController.on('object.select', forceUpdate);
        appController.previewController.on('seek', forceUpdate);
        appController.previewController.on('tick', forceUpdate);

        return () => {
            appController.off('project.open', onProjectOpen);
            appController.off('project.change', forceUpdate);
            appController.off('object.select', forceUpdate);
            appController.previewController.off('seek', forceUpdate);
            appController.previewController.off('tick', forceUpdate);
        };
    }, [appController, forceUpdate, onProjectOpen]);

    const { layoutItems, canvasScrollHeight } = computeTimelineNodeLayoutData(
        appController.project.objects,
        canvasTop,
        canvasHeight,
        canvasWidth,
        leftInMS,
        pixelPerMS
    );

    const snapPositionXsBase = layoutItems.map((layoutData) => [layoutData.rect.x, layoutData.rect.x + layoutData.rect.width]).flat();

    const objectViews: React.ReactNode[] = layoutItems.map((layoutData) => {
        const snapPositionXs = snapPositionXsBase.slice();
        for (const targetX of [layoutData.rect.x, layoutData.rect.x + layoutData.rect.width]) {
            const i = snapPositionXs.indexOf(targetX);
            if (i === -1) continue;

            snapPositionXs.splice(i, 1);
        }

        return (
            <layoutData.ComponentType
                {...layoutData.rect}
                object={layoutData.object}
                key={layoutData.object.id}
                snapPositionXs={snapPositionXs}
                isSelected={appController.selectedObjectId === layoutData.object.id}
                onClick={onTimelineObjectClick}
                onChange={onTimelineObjectChange}
                onKeyframeClick={onTimelineObjectKeyframeClick}
            />
        );
    });

    return (
        <Base onMouseMove={onMouseMove}>
            <ScrollWrapper ref={setCanvasContainer}>
                <div
                    style={{
                        width: appController.previewController.durationInMS * pixelPerMS,
                        height: Math.max(canvasHeight, canvasScrollHeight),
                    }}
                />
                <CustomStage options={options}>
                    <TimelineContext.Provider
                        value={{
                            pixelPerMS,
                            leftInMS,
                            rightInMS,
                        }}
                    >
                        <TimelineBase
                            fps={appController.project.fps}
                            width={canvasWidth}
                            height={canvasHeight}
                            onClick={onTimelineBaseClick}
                        >
                            {objectViews}

                            {leftInMS < appController.previewController.currentTimeInMS &&
                                appController.previewController.currentTimeInMS < rightInMS && (
                                    <CurrentTimeIndicator
                                        x={(appController.previewController.currentTimeInMS - leftInMS) * pixelPerMS}
                                        height={canvasHeight}
                                    />
                                )}

                            <MouseTimeIndicator x={mouseX} height={canvasHeight} />
                        </TimelineBase>
                    </TimelineContext.Provider>
                </CustomStage>
            </ScrollWrapper>
        </Base>
    );
}

function computeTimelineNodeLayoutData(
    objects: BaseObject[],
    canvasTop: number,
    canvasHeight: number,
    canvasWidth: number,
    leftInMS: number,
    pixelPerMS: number
): {
    layoutItems: TimelineNodeLayoutData[];
    canvasScrollHeight: number;
} {
    const layoutItems: TimelineNodeLayoutData[] = [];
    let y = 10 - canvasTop;
    for (const object of objects) {
        let height: number;
        if (VideoObject.isVideo(object)) {
            height = 56;
        } else {
            height = 36;
        }
        const x = (object.startInMS - leftInMS) * pixelPerMS;
        const width = (object.endInMS - object.startInMS) * pixelPerMS;

        if (canvasHeight > y && 0 < y + height && canvasWidth > x && 0 < x + width) {
            const ComponentType = TimelineObjectViewComponentMap[object.type] ?? TimelineBaseObjectView;
            layoutItems.push({
                object: object,
                ComponentType,
                rect: { x: x, y: y, width: width, height: height },
            });
        }
        y += height;
    }
    const canvasScrollHeight = y;

    return { layoutItems, canvasScrollHeight };
}

function quantizeTime(timeInMS: number, fps: number): number {
    return Math.round(timeInMS / (1000 / fps)) * (1000 / fps);
}
