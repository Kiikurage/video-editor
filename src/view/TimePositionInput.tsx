import * as React from 'react';
import styled from 'styled-components';
import { noop } from '../lib/util';
import { AutoResizeInput } from './AutoResizeInput';
import { useCallbackRef } from './hooks/useCallbackRef';

const Base = styled.span`
    font-weight: 100;
    line-height: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
`;

const FrameCountLabel = styled.span`
    font-size: 0.9em;
`;

const Separator = styled.span`
    opacity: 0.3;
`;

interface Props {
    defaultValue?: number;
    value?: number;
    fps: number;
    onChange?: (valueInMS: number) => void;
}

export function TimePositionInput(props: Props): React.ReactElement {
    const { fps, onChange = noop } = props;

    // const [value, setValue] = useFormState<number>(props.defaultValue ?? 0, props.value);
    const value = props.value ?? props.defaultValue ?? 0;

    const hour = Math.floor(value / 1000 / 60 / 60);
    const minute = Math.floor(value / 1000 / 60) % 60;
    const second = Math.floor(value / 1000) % 60;
    const millisecond = Math.floor(value) / 1000;
    const frame = Math.round((millisecond * fps) / 1000);

    const onHourChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        let newHour = parseInt(ev.target.value);
        if (isNaN(newHour)) newHour = 0;
        onChange(((newHour * 60 + minute) * 60 + second) * 1000 + millisecond);
    });
    const onMinuteChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        let newMinute = parseInt(ev.target.value);
        if (isNaN(newMinute)) newMinute = 0;
        onChange(((hour * 60 + newMinute) * 60 + second) * 1000 + millisecond);
    });
    const onSecondChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        let newSecond = parseInt(ev.target.value);
        if (isNaN(newSecond)) newSecond = 0;
        onChange(((hour * 60 + minute) * 60 + newSecond) * 1000 + millisecond);
    });
    const onMillisecondChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        let newMillisecond = parseInt(ev.target.value);
        if (isNaN(newMillisecond)) newMillisecond = 0;
        onChange(((hour * 60 + minute) * 60 + second) * 1000 + newMillisecond);
    });

    return (
        <Base>
            <AutoResizeInput value={hour.toString().padStart(2, '0')} onChange={onHourChange} />
            <Separator>;</Separator>
            <AutoResizeInput value={minute.toString().padStart(2, '0')} onChange={onMinuteChange} />
            <Separator>;</Separator>
            <AutoResizeInput value={second.toString().padStart(2, '0')} onChange={onSecondChange} />
            <FrameCountLabel>
                <Separator>;</Separator>
                <AutoResizeInput value={frame.toString().padStart(2, '0')} onChange={onMillisecondChange} />
            </FrameCountLabel>
        </Base>
    );
}
