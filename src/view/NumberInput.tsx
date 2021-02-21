import * as React from 'react';
import styled from 'styled-components';
import { noop } from '../lib/util';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useFormState } from './hooks/useFormState';

const Base = styled.label`
    height: 32px;
    padding: 0 6px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid #c0c0c0;
    font-family: monospace;
    font-size: 16px;
    line-height: 1.5;
    border-radius: 4px;
`;

const Input = styled.input`
    font: inherit;
    line-height: inherit;
    border: none;
    outline: none;
    flex: 1 1 0;
    display: block;
    width: 100%;
`;

interface Props {
    defaultValue?: number;
    value?: number;
    min?: number;
    max?: number;
    onChange?: (newValue: number) => void;
    readOnly?: boolean;
}

export function NumberInput(props: Props): React.ReactElement {
    const { onChange = noop, readOnly = false, min, max } = props;

    const [value, setValue] = useFormState(props.defaultValue ?? 0, props.value);

    const onBaseChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(ev.target.value);

        setValue(newValue);
        onChange(newValue);
    });
    return (
        <Base>
            <Input type="number" value={value} min={min} max={max} onChange={onBaseChange} readOnly={readOnly} />
        </Base>
    );
}
