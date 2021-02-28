import * as React from 'react';
import { ImageObject } from '../../model/objects/ImageObject';
import { TimelineObjectViewProps } from './TimelineBaseObjectView';
import { TimelineNodeBase } from './TimelineNodeBase';

export function TimelineImageObjectView(props: TimelineObjectViewProps<ImageObject>): React.ReactElement {
    const { x, y, width, height, object, isSelected, snapPositionXs, onClick, onChange, onKeyframeClick } = props;

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
            object={object}
            text={`画像: ${object.srcFilePath}`}
            isSelected={isSelected}
            snapPositionXs={snapPositionXs}
            keyframeTimings={keyframeTimings}
            onChange={onChange}
            onClick={onClick}
            onKeyframeClick={onKeyframeClick}
        />
    );
}
