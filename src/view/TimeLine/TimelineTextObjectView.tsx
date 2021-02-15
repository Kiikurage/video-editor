import * as React from 'react';
import { TextObject } from '../../model/objects/TextObject';
import { TimelineObjectViewProps } from './TimelineBaseObjectView';
import { TimelineNodeBase } from './TimelineNodeBase';

export function TimelineTextObjectView(props: TimelineObjectViewProps<TextObject>): React.ReactElement {
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
            text={`"${object.text}"`}
            isSelected={isSelected}
            snapPositionXs={snapPositionXs}
            keyframeTimings={keyframeTimings}
            onChange={onChange}
            onClick={onClick}
            onKeyframeClick={onKeyframeClick}
        />
    );
}
