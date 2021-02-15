import * as PIXI from 'pixi.js';
import * as React from 'react';
import { BaseObject } from '../../model/objects/BaseObject';
import { TimelineNodeBase } from './TimelineNodeBase';

export interface TimelineObjectViewProps<T extends BaseObject = BaseObject> {
    x: number;
    y: number;
    width: number;
    height: number;
    object: T;
    isSelected: boolean;
    snapPositionXs: number[];
    onClick: (ev: PIXI.InteractionEvent, object: T) => void;
    onChange: (object: T, newX: number, newWidth: number) => void;
    onKeyframeClick: (ev: PIXI.InteractionEvent, object: T, keyframeTiming: number) => void;
}

export function TimelineBaseObjectView(props: TimelineObjectViewProps): React.ReactElement {
    const { x, y, width, height, object, isSelected, snapPositionXs, onClick, onChange, onKeyframeClick } = props;
    return (
        <TimelineNodeBase
            x={x}
            y={y}
            width={width}
            height={height}
            object={object}
            text={object.type}
            isSelected={isSelected}
            snapPositionXs={snapPositionXs}
            keyframeTimings={[]}
            onChange={onChange}
            onClick={onClick}
            onKeyframeClick={onKeyframeClick}
        />
    );
}
