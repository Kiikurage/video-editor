import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { Stage } from 'react-pixi-fiber';
import QuickPinchZoom from 'react-quick-pinch-zoom';
import styled from 'styled-components';
import { BaseObject } from '../model/objects/BaseObject';
import { CaptionObject } from '../model/objects/CaptionObject';
import { Project } from '../model/Project';
import { PreviewController } from '../service/PreviewController';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useThrottledForceUpdate } from './hooks/useThrottledForceUpdate';
import { CurrentTimeIndicator } from './pixi/TimeLine/CurrentTimeIndicator';
import { Divider } from './pixi/TimeLine/Divider';
import { MouseTimeIndicator } from './pixi/TimeLine/MouseTimeIndicator';
import { ObjectView } from './pixi/TimeLine/ObjectView';

PIXI.settings.RENDER_OPTIONS.autoDensity = true;
PIXI.settings.RENDER_OPTIONS.resolution = devicePixelRatio;

const Base = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    width: 100%;
    height: 100%;
    position: relative;
    background: #fcfcfc;
    overflow: auto auto;
`;

interface Props {
    previewController: PreviewController;
    project: Project;
    selectedObject: BaseObject | null;
    onObjectUpdate: (oldValue: BaseObject, newValue: BaseObject) => void;
    onObjectSelect: (object: BaseObject) => void;
}

export function TimeLine(props: Props): React.ReactElement {
    const { previewController, project, selectedObject, onObjectSelect, onObjectUpdate } = props;

    const durationInMSForVisibleAreaRef = useRef(Math.max(previewController.durationInMS, 1));
    const dividerDurationInMS = computeBestDividerDurationInMS(durationInMSForVisibleAreaRef.current);

    const mouseXRef = useRef(0);
    const baseRef = useRef<HTMLDivElement | null>(null);
    const forceUpdate = useThrottledForceUpdate();

    const onVideoControllerSeek = useCallbackRef(() => {
        forceUpdate();
    });

    useEffect(() => {
        durationInMSForVisibleAreaRef.current = Math.max(previewController.durationInMS, 1);
        forceUpdate();
    }, [forceUpdate, previewController.durationInMS]);

    useEffect(() => {
        previewController.on('seek', onVideoControllerSeek);

        return () => {
            previewController.off('seek', onVideoControllerSeek);
        };
    }, [onVideoControllerSeek, previewController]);

    const onPinchZoomUpdate = useCallbackRef((data: { x: number; y: number; scale: number }) => {
        const scale = data.scale;
        durationInMSForVisibleAreaRef.current = Math.max(previewController.durationInMS, 1) / scale;
        forceUpdate();
    });

    const onObjectLayerMouseMove = useCallbackRef((ev: React.MouseEvent) => {
        const base = baseRef.current;
        if (!base) return;

        const { left: baseLeft, width: baseWidth } = base.getBoundingClientRect();
        mouseXRef.current = (ev.clientX - baseLeft) / baseWidth;
        forceUpdate();
    });

    const onObjectLayerClick = useCallbackRef((ev: React.MouseEvent) => {
        const base = baseRef.current;
        if (!base) return;

        const { left: baseLeft, width: baseWidth } = base.getBoundingClientRect();
        previewController.currentTimeInMS = (durationInMSForVisibleAreaRef.current * (ev.clientX - baseLeft)) / baseWidth;
    });

    const onObjectClick = useCallbackRef((object: BaseObject) => {
        onObjectSelect(object);
    });

    const currentTimeIndicatorLeft = previewController.currentTimeInMS / durationInMSForVisibleAreaRef.current;

    const dividerLeftPositionPercent = dividerDurationInMS / durationInMSForVisibleAreaRef.current;
    const { height: baseHeight, width: baseWidth } = baseRef.current?.getBoundingClientRect() ?? { height: 100, width: 100 };

    const pixiStageOption = useMemo(() => {
        return { backgroundColor: 0xffffff, width: baseWidth, height: baseHeight };
    }, [baseHeight, baseWidth]);

    return (
        <QuickPinchZoom onUpdate={onPinchZoomUpdate} maxZoom={50} minZoom={0.1} zoomOutFactor={0}>
            <Base ref={(e) => (baseRef.current = e)} onMouseMove={onObjectLayerMouseMove} onClick={onObjectLayerClick}>
                <Stage options={pixiStageOption}>
                    <Divider
                        x={baseWidth * dividerLeftPositionPercent * 1}
                        height={baseHeight}
                        label={formatTime(dividerDurationInMS * 1)}
                    />
                    <Divider
                        x={baseWidth * dividerLeftPositionPercent * 2}
                        height={baseHeight}
                        label={formatTime(dividerDurationInMS * 2)}
                    />
                    <Divider
                        x={baseWidth * dividerLeftPositionPercent * 3}
                        height={baseHeight}
                        label={formatTime(dividerDurationInMS * 3)}
                    />
                    <Divider
                        x={baseWidth * dividerLeftPositionPercent * 4}
                        height={baseHeight}
                        label={formatTime(dividerDurationInMS * 4)}
                    />
                    <Divider
                        x={baseWidth * dividerLeftPositionPercent * 5}
                        height={baseHeight}
                        label={formatTime(dividerDurationInMS * 5)}
                    />
                    <Divider
                        x={baseWidth * dividerLeftPositionPercent * 6}
                        height={baseHeight}
                        label={formatTime(dividerDurationInMS * 6)}
                    />
                    <Divider
                        x={baseWidth * dividerLeftPositionPercent * 7}
                        height={baseHeight}
                        label={formatTime(dividerDurationInMS * 7)}
                    />

                    {project.objects.map((object, i) => {
                        const isSelected = object === selectedObject;
                        const left = (baseWidth * object.startInMS) / durationInMSForVisibleAreaRef.current;
                        const width = (baseWidth * (object.endInMS - object.startInMS)) / durationInMSForVisibleAreaRef.current;
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
                                    const newStartInMS = (durationInMSForVisibleAreaRef.current * newX) / baseWidth;
                                    const newEndInMS = newStartInMS + (durationInMSForVisibleAreaRef.current * newWidth) / baseWidth;
                                    onObjectUpdate(object, {
                                        ...object,
                                        startInMS: newStartInMS,
                                        endInMS: newEndInMS,
                                    });
                                }}
                            />
                        );
                    })}

                    <CurrentTimeIndicator x={baseWidth * currentTimeIndicatorLeft} height={baseHeight} />
                    <MouseTimeIndicator x={baseWidth * mouseXRef.current} height={baseHeight} />
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

function computeBestDividerDurationInMS(durationInMSForVisibleArea: number): number {
    // 画面内にdividerが7本, 8セクション分表示されるようなscaleが最適であるとする
    return (
        PREDEFINED_DIVIDER_DURATIONS.find((duration) => duration * 8 > durationInMSForVisibleArea) ??
        PREDEFINED_DIVIDER_DURATIONS[PREDEFINED_DIVIDER_DURATIONS.length - 1]
    );
}
