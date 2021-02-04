import * as React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useCallbackRef } from './hooks/useCallbackRef';

const Base = styled.button``;

interface Props {
    onChange: (files: File[]) => void;
}

export function FileSelectDialogButton(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { children, onChange } = props;

    const onInputChange = useCallbackRef(() => {
        onChange(Array.from(inputRef.current?.files ?? []));
    });

    const inputRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', onInputChange);

        inputRef.current = input;

        return () => {
            input.removeEventListener('change', onInputChange);
        };
    }, [onInputChange]);

    const onClick = useCallbackRef(() => {
        inputRef.current?.click();
    });

    return <Base onClick={onClick}>{children}</Base>;
}
