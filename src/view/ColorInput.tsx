import * as React from 'react';
import styled from 'styled-components';
import { convertColorFromDOMToPixi } from '../lib/convertColorFromDOMToPixi';
import { convertColorFromPixiToDOM } from '../lib/convertColorFromPixiToDOM';
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
    onChange?: (newValue: number) => void;
    readOnly?: boolean;
}

export function ColorInput(props: Props): React.ReactElement {
    const { onChange = noop, readOnly = false } = props;

    const [value, setValue] = useFormState(props.defaultValue ?? 0, props.value);

    const onBaseChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = convertColorFromDOMToPixi(ev.target.value);

        setValue(newValue);
        onChange(newValue);
    });
    return (
        <Base>
            <Input type="color" value={convertColorFromPixiToDOM(value)} onChange={onBaseChange} readOnly={readOnly} />
        </Base>
    );
}
