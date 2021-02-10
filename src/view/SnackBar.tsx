import { mix } from 'polished';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { SnackBarController } from '../service/SnackBarController';
import { useCallbackRef } from './hooks/useCallbackRef';

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(50px);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const EASING = 'cubic-bezier(0, 0.5, 0.3, 1)';

const fadeOut = keyframes`
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  80% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    transform: translateX(50px);
  }
`;

const Base = styled.div<{ color: string; fadeOut: boolean }>`
    position: relative;
    font-size: 14px;
    padding: 8px 16px;
    min-width: 128px;
    border-radius: 4px;
    background: ${(props) => mix(0.6, props.color, '#ffffff')};
    color: ${(props) => mix(0.05, props.color, '#ffffff')};
    box-shadow: rgba(50, 50, 93, 0.15) 0 2px 5px -1px, rgba(0, 0, 0, 0.2) 0px 1px 3px -1px;
    cursor: pointer;
    animation: ${(props) => (props.fadeOut ? fadeOut : fadeIn)} 1000ms ${EASING} forwards;
`;

interface Props {
    messageId: number;
    color: string;
    clearAfterInMS?: number;
}

export function SnackBar(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { messageId, color, clearAfterInMS, children } = props;
    const [fadeOut, setFadeOut] = useState(false);

    const doFadeOut = useCallbackRef(() => {
        if (fadeOut) return;

        setFadeOut(true);
        setTimeout(() => SnackBarController.clearMessage(messageId), 500);
    });

    useEffect(() => {
        if (clearAfterInMS === -1) return;

        const timerId = setTimeout(() => {
            doFadeOut();
        }, clearAfterInMS);

        return () => {
            clearTimeout(timerId);
        };
    }, [doFadeOut, clearAfterInMS]);

    return (
        <Base fadeOut={fadeOut} color={color} onClick={doFadeOut}>
            {children}
        </Base>
    );
}
