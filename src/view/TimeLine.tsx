import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Stage } from 'react-pixi-fiber';
import QuickPinchZoom from 'react-quick-pinch-zoom';
import styled from 'styled-components';
import { range } from '../lib/range';
import { BaseObject } from '../model/objects/BaseObject';
import { CaptionObject } from '../model/objects/CaptionObject';
import { Project } from '../model/Project';
import { PreviewController } from '../service/PreviewController';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useFormState } from './hooks/useFormState';
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
    height: 100%;
    background: #fff;
    overflow: auto auto;

    > canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
`;

interface Props {
    previewController: PreviewController;
    project: Project;
    selectedObject: BaseObject | null;
    onChangeObject: (oldValue: BaseObject, newValue: BaseObject) => void;
    onSelectObject: (object: BaseObject) => void;
}

export function TimeLine(props: Props): React.ReactElement {
    const { previewController, project, selectedObject, onSelectObject, onChangeObject } = props;

    const [durationInMSForVisibleArea, setDurationInMSForVisibleArea] = useFormState(Math.max(previewController.durationInMS, 1));
    const [mouseX, setMouseX] = useState(0);
    const [baseSize, setBaseSize] = useState({ width: 100, height: 100 });
    const forceUpdate = useThrottledForceUpdate();

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
        const SCALE_FACTOR = 2;
        const scale = (data.scale - 1) * SCALE_FACTOR + 1;
        setDurationInMSForVisibleArea(Math.max(previewController.durationInMS, 1) / scale);
    });

    const onObjectLayerMouseMove = useCallbackRef((ev: React.MouseEvent) => {
        setMouseX(ev.clientX);
    });

    const onObjectLayerClick = useCallbackRef((ev: React.MouseEvent) => {
        previewController.currentTimeInMS = (durationInMSForVisibleArea * ev.clientX) / baseSize.width;
    });

    const onObjectClick = useCallbackRef((object: BaseObject) => {
        onSelectObject(object);
    });

    const pixiStageOption = useMemo(() => {
        return { backgroundColor: 0xffffff, width: baseSize.width, height: baseSize.height };
    }, [baseSize]);

    const MINIMUM_DIVIDER_SPAN_IN_PX = 70;
    const dividerDurationInMS =
        PREDEFINED_DIVIDER_DURATIONS.find(
            (duration) => (baseSize.width * duration) / durationInMSForVisibleArea > MINIMUM_DIVIDER_SPAN_IN_PX
        ) ?? PREDEFINED_DIVIDER_DURATIONS[PREDEFINED_DIVIDER_DURATIONS.length - 1];

    return (
        <QuickPinchZoom onUpdate={onPinchZoomUpdate} maxZoom={50} minZoom={0.1} zoomOutFactor={0}>
            <Base ref={onBaseElementReferenceUpdate} onMouseMove={onObjectLayerMouseMove} onClick={onObjectLayerClick}>
                <Stage options={pixiStageOption}>
                    {range(Math.ceil(durationInMSForVisibleArea / dividerDurationInMS)).map((i) => (
                        <Divider
                            key={i}
                            x={(baseSize.width * i * dividerDurationInMS) / durationInMSForVisibleArea}
                            height={baseSize.height}
                            label={formatTime(i * dividerDurationInMS)}
                        />
                    ))}

                    {project.objects.map((object, i) => {
                        const isSelected = object === selectedObject;
                        const left = (baseSize.width * object.startInMS) / durationInMSForVisibleArea;
                        const width = (baseSize.width * (object.endInMS - object.startInMS)) / durationInMSForVisibleArea;
                        return (
                            <ObjectView
                                key={object.id}
                                isSelected={isSelected}
                                text={CaptionObject.isCaption(object) ? object.text : `[${object.type}]`}
                                x={left}
                                y={32 + 20 * i}
                                width={width}
                                height={22}
                                onClick={() => onObjectClick(object)}
                                onMoveAndResize={(newX, newWidth) => {
                                    const newStartInMS = (durationInMSForVisibleArea * newX) / baseSize.width;
                                    const newEndInMS = newStartInMS + (durationInMSForVisibleArea * newWidth) / baseSize.width;
                                    onChangeObject(object, {
                                        ...object,
                                        startInMS: newStartInMS,
                                        endInMS: newEndInMS,
                                    });
                                }}
                            />
                        );
                    })}

                    <CurrentTimeIndicator
                        x={(baseSize.width * previewController.currentTimeInMS) / durationInMSForVisibleArea}
                        height={baseSize.height}
                    />
                    <MouseTimeIndicator x={mouseX} height={baseSize.height} />
                </Stage>
            </Base>
        </QuickPinchZoom>
    );
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
