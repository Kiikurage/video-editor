import { rgba } from 'polished';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { BaseObject } from '../model/BaseObject';
import { CaptionObject } from '../model/CaptionObject';
import { Project } from '../model/Project';
import { PreviewController } from '../service/PreviewController';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useThrottledForceUpdate } from './hooks/useThrottledForceUpdate';
import QuickPinchZoom from 'react-quick-pinch-zoom';

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

const Layer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`;

const DividersLayer = styled(Layer)`
    pointer-events: none;
`;

const Divider = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #e0e0e0;
`;

const DividerTimeLabel = styled.div`
    display: block;
    position: absolute;
    right: 0;
    top: 0;
    padding: 0 4px;
    font-size: 12px;
    line-height: 24px;
    font-family: monospace;
    color: #808080;
`;

const MouseTimeIndicator = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    border-left: 1px solid #4d90fe;
    border-right: 1px solid #4d90fe;
`;

const CurrentTimeIndicator = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    border-left: 1px solid #000;
`;

const ObjectLayer = styled(Layer)`
    cursor: text;
    padding: 32px 0;

    ${MouseTimeIndicator} {
        display: none;
    }

    &:hover {
        ${MouseTimeIndicator} {
            display: block;
        }
    }
`;

const ObjectView = styled.div<{ selected: boolean }>`
    position: relative;
    height: 20px;
    background: ${rgba('#4d90fe', 0.7)};
    border: 1px solid ${(props) => (props.selected ? '#f00' : '#4d90fe')};
    color: #fff;
    padding: 0 4px;
    line-height: 20px;
    font-size: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
    cursor: pointer;
`;

interface Props {
    previewController: PreviewController;
    project: Project;
    selectedObject: BaseObject | null;
    onObjectSelect: (object: BaseObject) => void;
}

export function TimeLine(props: Props): React.ReactElement {
    const { previewController, project, selectedObject, onObjectSelect } = props;

    const durationInMSForVisibleAreaRef = useRef(Math.max(previewController.durationInMS, 1));
    const dividerDurationInMS = computeBestDividerDurationInMS(durationInMSForVisibleAreaRef.current);
    const dividerLeftPositionPercent = (100 * dividerDurationInMS) / durationInMSForVisibleAreaRef.current;

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
        previewController.addEventListener('seek', onVideoControllerSeek);
        return () => {
            previewController.removeEventListener('seek', onVideoControllerSeek);
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
        mouseXRef.current = (100 * (ev.clientX - baseLeft)) / baseWidth;
        forceUpdate();
    });

    const onObjectLayerClick = useCallbackRef((ev: React.MouseEvent) => {
        const base = baseRef.current;
        if (!base) return;

        const { left: baseLeft, width: baseWidth } = base.getBoundingClientRect();
        previewController.currentTimeInMS = (durationInMSForVisibleAreaRef.current * (ev.clientX - baseLeft)) / baseWidth;
    });

    const onObjectClick = useCallbackRef((ev: React.MouseEvent, object: BaseObject) => {
        onObjectSelect(object);
    });

    const currentTimeIndicatorLeft = (100 * previewController.currentTimeInMS) / durationInMSForVisibleAreaRef.current;

    return (
        <QuickPinchZoom onUpdate={onPinchZoomUpdate} maxZoom={50} minZoom={0.1} zoomOutFactor={0}>
            <Base ref={(e) => (baseRef.current = e)}>
                <DividersLayer>
                    <Divider style={{ left: `${dividerLeftPositionPercent * 1}%` }}>
                        <DividerTimeLabel>{formatTime(dividerDurationInMS * 1)}</DividerTimeLabel>
                    </Divider>
                    <Divider style={{ left: `${dividerLeftPositionPercent * 2}%` }}>
                        <DividerTimeLabel>{formatTime(dividerDurationInMS * 2)}</DividerTimeLabel>
                    </Divider>
                    <Divider style={{ left: `${dividerLeftPositionPercent * 3}%` }}>
                        <DividerTimeLabel>{formatTime(dividerDurationInMS * 3)}</DividerTimeLabel>
                    </Divider>
                    <Divider style={{ left: `${dividerLeftPositionPercent * 4}%` }}>
                        <DividerTimeLabel>{formatTime(dividerDurationInMS * 4)}</DividerTimeLabel>
                    </Divider>
                    <Divider style={{ left: `${dividerLeftPositionPercent * 5}%` }}>
                        <DividerTimeLabel>{formatTime(dividerDurationInMS * 5)}</DividerTimeLabel>
                    </Divider>
                    <Divider style={{ left: `${dividerLeftPositionPercent * 6}%` }}>
                        <DividerTimeLabel>{formatTime(dividerDurationInMS * 6)}</DividerTimeLabel>
                    </Divider>
                    <Divider style={{ left: `${dividerLeftPositionPercent * 7}%` }}>
                        <DividerTimeLabel>{formatTime(dividerDurationInMS * 7)}</DividerTimeLabel>
                    </Divider>
                </DividersLayer>
                <ObjectLayer onMouseMove={onObjectLayerMouseMove} onClick={onObjectLayerClick}>
                    <CurrentTimeIndicator style={{ left: `${currentTimeIndicatorLeft}%` }} />
                    <MouseTimeIndicator style={{ left: `${mouseXRef.current}%` }} />
                    {project.objects.map((object) => {
                        const isSelected = object === selectedObject;
                        const left = `${(100 * object.startInMS) / durationInMSForVisibleAreaRef.current}%`;
                        const width = `${(100 * (object.endInMS - object.startInMS)) / durationInMSForVisibleAreaRef.current}%`;
                        return (
                            <ObjectView
                                selected={isSelected}
                                key={[object.startInMS, object.endInMS].join(',')}
                                style={{ left: left, width: width }}
                                onClick={(ev: React.MouseEvent) => onObjectClick(ev, object)}
                            >
                                {CaptionObject.isCaption(object) ? object.text : `[${object.type}]`}
                            </ObjectView>
                        );
                    })}
                </ObjectLayer>
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

function computeBestDividerDurationInMS(durationInMSForVisibleArea: number) {
    // 画面内にdividerが7本, 8セクション分表示されるようなscaleが最適であるとする
    return (
        PREDEFINED_DIVIDER_DURATIONS.find((duration) => duration * 8 > durationInMSForVisibleArea) ??
        PREDEFINED_DIVIDER_DURATIONS[PREDEFINED_DIVIDER_DURATIONS.length - 1]
    );
}
