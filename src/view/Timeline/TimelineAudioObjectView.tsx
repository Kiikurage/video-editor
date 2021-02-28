import * as React from 'react';
import { AudioObject } from '../../model/objects/AudioObject';
import { TimelineObjectViewProps } from './TimelineBaseObjectView';
import { TimelineNodeBase } from './TimelineNodeBase';

export function TimelineAudioObjectView(props: TimelineObjectViewProps<AudioObject>): React.ReactElement {
    const { x, y, width, height, object, isSelected, snapPositionXs, onClick, onChange, onKeyframeClick } = props;

    const keyframeTimings = Array.from(new Set([...object.volume.keyframes.map((frame) => frame.timing)]));

    return (
        <TimelineNodeBase
            x={x}
            y={y}
            width={width}
            height={height}
            object={object}
            text={`音声: ${object.srcFilePath}`}
            isSelected={isSelected}
            snapPositionXs={snapPositionXs}
            keyframeTimings={keyframeTimings}
            onChange={onChange}
            onClick={onClick}
            onKeyframeClick={onKeyframeClick}
        />
    );
}
