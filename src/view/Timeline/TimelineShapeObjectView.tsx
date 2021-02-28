import * as React from 'react';
import { ShapeObject } from '../../model/objects/ShapeObject';
import { TimelineObjectViewProps } from './TimelineBaseObjectView';
import { TimelineNodeBase } from './TimelineNodeBase';

export function TimelineShapeObjectView(props: TimelineObjectViewProps<ShapeObject>): React.ReactElement {
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
            text={`図形: ${object.shapeType}`}
            isSelected={isSelected}
            snapPositionXs={snapPositionXs}
            keyframeTimings={keyframeTimings}
            onChange={onChange}
            onClick={onClick}
            onKeyframeClick={onKeyframeClick}
        />
    );
}
