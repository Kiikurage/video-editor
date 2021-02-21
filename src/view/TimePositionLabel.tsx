import * as React from 'react';
import styled from 'styled-components';

const Base = styled.div`
    font-family: monospace;
    font-size: 1.5em;
    font-weight: 100;
`;

const FrameCountLabel = styled.span`
    font-size: 0.9em;
`;

const Separator = styled.span`
    opacity: 0.3;
`;

interface Props {
    timeInMS: number;
    fps: number;
}

export function TimePositionLabel(props: Props): React.ReactElement {
    const { timeInMS, fps } = props;

    const hour = Math.floor(timeInMS / 1000 / 60 / 60);
    const minute = Math.floor(timeInMS / 1000 / 60) % 60;
    const second = Math.floor(timeInMS / 1000) % 60;
    const millisecond = Math.floor(timeInMS) / 1000;
    const frame = Math.round((millisecond * fps) / 1000);

    return (
        <Base>
            <span>{hour}</span>
            <Separator>;</Separator>
            <span>{minute.toString().padStart(2, '0')}</span>
            <Separator>;</Separator>
            <span>{second.toString().padStart(2, '0')}</span>
            <FrameCountLabel>
                <Separator>;</Separator>
                {frame.toString().padStart(2, '0')}
            </FrameCountLabel>
        </Base>
    );
}
