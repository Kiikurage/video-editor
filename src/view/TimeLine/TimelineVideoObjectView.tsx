import * as React from 'react';
import { useEffect, useReducer, useRef } from 'react';
import { VideoObject } from '../../model/objects/VideoObject';
import { KeyframeLoader } from '../../service/KeyFrameLoader';
import { ThumbnailList } from './ThumbnailList';
import { useTimelineCanvasViewportInfo } from './Timeline';
import { TimelineObjectViewProps } from './TimelineBaseObjectView';
import { TimelineNodeBase, TimelineNodeResizeContext } from './TimelineNodeBase';

export function TimelineVideoObjectView(props: TimelineObjectViewProps<VideoObject>): React.ReactElement {
    const { x, y, width, height, object, isSelected, snapPositionXs, onClick, onChange, onKeyframeClick } = props;
    const { pixelPerMS } = useTimelineCanvasViewportInfo();

    const [forceRerenderCounter, forceRerender] = useReducer((x: number) => x + 1, 0);
    const keyframeLoader = useRef<KeyframeLoader | null>(null);
    useEffect(() => {
        keyframeLoader.current = new KeyframeLoader(object.srcFilePath);
        keyframeLoader.current.on('load', forceRerender);
        void keyframeLoader.current.start();

        return () => {
            keyframeLoader.current?.clearAllCache();
            keyframeLoader.current?.off('load', forceRerender);
        };
    }, [forceRerender, object.srcFilePath]);

    const keyframeTimings = Array.from(
        new Set([
            ...object.x.keyframes.map((frame) => frame.timing),
            ...object.y.keyframes.map((frame) => frame.timing),
            ...object.width.keyframes.map((frame) => frame.timing),
            ...object.height.keyframes.map((frame) => frame.timing),
        ])
    );

    return (
        <TimelineNodeBase
            x={x}
            y={y}
            width={width}
            height={height}
            snapPositionXs={snapPositionXs}
            object={object}
            isSelected={isSelected}
            text={object.srcFilePath}
            keyframeTimings={keyframeTimings}
            onClick={onClick}
            onChange={onChange}
            onKeyframeClick={onKeyframeClick}
        >
            <TimelineNodeResizeContext.Consumer>
                {({ width, height }) => (
                    <ThumbnailList
                        /* To force rerender thumbnail list */ forceRerenderCounter={forceRerenderCounter}
                        width={width}
                        height={height}
                        pixelPerMS={pixelPerMS}
                        keyframeLoader={keyframeLoader.current}
                    />
                )}
            </TimelineNodeResizeContext.Consumer>
        </TimelineNodeBase>
    );
}
