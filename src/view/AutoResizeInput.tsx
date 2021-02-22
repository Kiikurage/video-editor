import * as React from 'react';
import styled from 'styled-components';
import { useFormState } from './hooks/useFormState';

const Base = styled.div`
    position: relative;
    display: inline-block;
    font-weight: 100;
`;

const DisplayLayer = styled.div`
    position: relative;
    font-family: sans-serif;
    font-size: 1em;
    line-height: 1;
    padding-right: 1px;
`;

const InputLayer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: hidden;

    input {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: none;
        font-size: 1em;
        line-height: 1;
        font-family: sans-serif;
        padding: 0;
        border-width: 0;
        outline: none;
    }
`;

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function AutoResizeInput(props: Props): React.ReactElement {
    const [value] = useFormState(props.defaultValue, props.value);

    return (
        <Base>
            <DisplayLayer>{value ?? props.placeholder ?? ''}</DisplayLayer>
            <InputLayer>
                <input {...props} />
            </InputLayer>
        </Base>
    );
}
