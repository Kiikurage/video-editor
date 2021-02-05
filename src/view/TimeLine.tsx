import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Stage } from 'react-pixi-fiber';
import QuickPinchZoom from 'react-quick-pinch-zoom';
import styled from 'styled-components';
import { BaseObject } from '../model/objects/BaseObject';
import { CaptionObject } from '../model/objects/CaptionObject';
import { useAppController } from './AppControllerProvider';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useThrottledForceUpdate } from './hooks/useThrottledForceUpdate';
import { CurrentTimeIndicator } from './pixi/TimeLine/CurrentTimeIndicator';
import { Divider } from './pixi/TimeLine/Divider';
import { MouseTimeIndicator } from './pixi/TimeLine/MouseTimeIndicator';
import { ObjectView } from './pixi/TimeLine/ObjectView';

PIXI.settings.RENDER_OPTIONS.autoDensity = true;
PIXI.settings.RENDER_OPTIONS.resolution = devicePixelRatio;

const Base = styled.div`
    position: relative;
    width: 100%;
    max-width: 100%;
    height: 100%;
    background: #fff;
`;

const ScrollWrapper = styled.section`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto auto;

    > canvas {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
`;

const ScrollPlaceholder = styled.div`
    position: relative;
    display: block;
`;

const DEFAULT_SCALE = 1;

export function TimeLine(): React.ReactElement {
    const appController = useAppController();
    const { previewController, project, selectedObject } = appController;

    const forceUpdate = useThrottledForceUpdate();
    useEffect(() => {
        appController.on('project.change', forceUpdate);
        appController.on('object.select', forceUpdate);

        return () => {
            appController.off('project.change', forceUpdate);
            appController.off('object.select', forceUpdate);
        };
    }, [appController, forceUpdate]);

    const [pixelPerSecond, setPixelPerSecond] = useState(DEFAULT_SCALE);
    const [mouseX, setMouseX] = useState(0);
    const [baseSize, setBaseSize] = useState({ width: 100, height: 100 });
    const scrollPositionInScreenScale = useRef({ x: 0, y: 0 });

    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const onBaseElementReferenceUpdate = useCallbackRef((base: HTMLDivElement | null) => {
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
        }

        if (base === null) return;

        resizeObserverRef.current = new ResizeObserver((etntries) => {
            etntries.forEach((entry) => {
                setBaseSize({ width: entry.contentRect.width, height: entry.contentRect.height });
            });
        });
        resizeObserverRef.current.observe(base);
    });

    const onVideoControllerSeek = useCallbackRef(() => {
        forceUpdate();
    });
    useEffect(() => {
        previewController.on('seek', onVideoControllerSeek);

        return () => {
            previewController.off('seek', onVideoControllerSeek);
        };
    }, [onVideoControllerSeek, previewController]);

    const onPinchZoomUpdate = useCallbackRef((data: { x: number; y: number; scale: number }) => {
        setPixelPerSecond(10 ** (data.scale - 1));
    });

    const onObjectLayerMouseMove = useCallbackRef((ev: React.MouseEvent) => {
        setMouseX(ev.clientX);
    });

    const onObjectLayerClick = useCallbackRef((ev: React.MouseEvent) => {
        previewController.currentTimeInMS = ((scrollPositionInScreenScale.current.x + ev.nativeEvent.x) / pixelPerSecond) * 1000;
    });

    const onObjectClick = useCallbackRef((object: BaseObject) => appController.selectObject(object.id));

    const onScroll = useCallbackRef((ev: React.SyntheticEvent<HTMLElement>) => {
        scrollPositionInScreenScale.current.x = ev.currentTarget.scrollLeft;
        scrollPositionInScreenScale.current.y = ev.currentTarget.scrollTop;
        forceUpdate();
    });

    const pixiStageOption = useMemo(() => {
        return { backgroundColor: 0xffffff, width: baseSize.width, height: baseSize.height };
    }, [baseSize]);

    const visibleAreaMinTimeInMS = (scrollPositionInScreenScale.current.x / pixelPerSecond) * 1000;
    const visibleAreaMaxTimeInMS = visibleAreaMinTimeInMS + (baseSize.width / pixelPerSecond) * 1000;

    const durationInMSForVisibleArea = visibleAreaMaxTimeInMS - visibleAreaMinTimeInMS;
    const MINIMUM_DIVIDER_SPAN_IN_PX = 70;
    const dividerDurationInMS =
        PREDEFINED_DIVIDER_DURATIONS.find(
            (duration) => (baseSize.width * duration) / durationInMSForVisibleArea > MINIMUM_DIVIDER_SPAN_IN_PX
        ) ?? PREDEFINED_DIVIDER_DURATIONS[PREDEFINED_DIVIDER_DURATIONS.length - 1];

    const dividers: React.ReactNode[] = [];
    let durationOffset = Math.ceil(visibleAreaMinTimeInMS / dividerDurationInMS) * dividerDurationInMS;
    while (durationOffset < visibleAreaMaxTimeInMS) {
        dividers.push(
            <Divider
                key={dividers.length}
                x={((durationOffset - visibleAreaMinTimeInMS) * pixelPerSecond) / 1000}
                height={baseSize.height}
                label={formatTime(durationOffset)}
            />
        );
        durationOffset += dividerDurationInMS;
    }

    return (
        <QuickPinchZoom onUpdate={onPinchZoomUpdate} maxZoom={3} minZoom={0.01} wheelScaleFactor={1500} zoomOutFactor={0}>
            <Base ref={onBaseElementReferenceUpdate} onMouseMove={onObjectLayerMouseMove} onClick={onObjectLayerClick}>
                <ScrollWrapper onScroll={onScroll}>
                    <ScrollPlaceholder style={{ width: previewController.durationInMS * pixelPerSecond, height: 400 }}>
                        Scrollable
                    </ScrollPlaceholder>
                    <Stage options={pixiStageOption}>
                        {dividers}

                        {project.objects.map((object, i) => {
                            if (object.endInMS < visibleAreaMinTimeInMS || object.startInMS > visibleAreaMaxTimeInMS) {
                                return null;
                            }

                            const isSelected = object === selectedObject;
                            return (
                                <ObjectView
                                    key={object.id}
                                    isSelected={isSelected}
                                    text={CaptionObject.isCaption(object) ? object.text : `[${object.type}]`}
                                    object={object}
                                    y={32 + 20 * i}
                                    fps={project.fps}
                                    pixelPerSecond={pixelPerSecond}
                                    offsetInMS={visibleAreaMinTimeInMS}
                                    onClick={() => onObjectClick(object)}
                                    onChange={(newStartInMS, newEndInMS) => {
                                        appController.updateObject({
                                            ...object,
                                            startInMS: quantizeTime(newStartInMS, project.fps),
                                            endInMS: quantizeTime(newEndInMS, project.fps),
                                        });
                                    }}
                                />
                            );
                        })}

                        {visibleAreaMinTimeInMS < previewController.currentTimeInMS &&
                            previewController.currentTimeInMS < visibleAreaMaxTimeInMS && (
                                <CurrentTimeIndicator
                                    x={((previewController.currentTimeInMS - visibleAreaMinTimeInMS) / 1000) * pixelPerSecond}
                                    height={baseSize.height}
                                />
                            )}

                        <MouseTimeIndicator x={mouseX} height={baseSize.height} />
                    </Stage>
                </ScrollWrapper>
            </Base>
        </QuickPinchZoom>
    );
}

export function quantizeTime(timeInMS: number, fps: number): number {
    return Math.round(timeInMS / (1000 / fps)) * (1000 / fps);
}

function formatTime(timeInMS: number): string {
    const hour = Math.floor(timeInMS / 1000 / 60 / 60);
    const minute = Math.floor(timeInMS / 1000 / 60) % 60;
    const seconds = Math.floor(timeInMS / 1000) % 60;

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const PREDEFINED_DIVIDER_DURATIONS = [
    1 * 1000,
    5 * 1000,
    10 * 1000,
    30 * 1000,
    1 * 60 * 1000,
    5 * 60 * 1000,
    10 * 60 * 1000,
    30 * 60 * 1000,
    1 * 60 * 60 * 1000,
];
