import * as React from 'react';
import styled from 'styled-components';
import { useSnackBarController } from './hooks/useSnackBarController';
import { SnackBar } from './SnackBar';

const COLOR1 = '#4d90fe';
const COLOR2 = '#4d804d';
const COLOR3 = '#993d62';

const Base = styled.div`
    position: fixed;
    font-size: 14px;
    bottom: 32px;
    right: 32px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 8px;
`;

export function SnackBarList(): React.ReactElement {
    const messages = useSnackBarController();

    return (
        <Base>
            {messages.map((message) => (
                <SnackBar
                    key={message.id}
                    messageId={message.id}
                    color={message.type === 'error' ? COLOR3 : message.type === 'success' ? COLOR2 : COLOR1}
                    clearAfterInMS={message.clearAfterInMS}
                >
                    {message.text}
                </SnackBar>
            ))}
        </Base>
    );
}
