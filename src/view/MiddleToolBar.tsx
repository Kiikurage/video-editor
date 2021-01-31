import * as React from 'react';
import styled from 'styled-components';

const Base = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: #f0f0f0;
    border-top: 1px solid #c0c0c0;
    border-bottom: 1px solid #c0c0c0;
    padding: 4px 32px;
    min-height: 32px;
`;

interface Props {
    onPlayButtonClick: () => void;
    onPauseButtonClick: () => void;
}

export function MiddleToolBar(props: Props): React.ReactElement {
    const { onPauseButtonClick, onPlayButtonClick } = props;
    return (
        <Base>
            <button onClick={onPlayButtonClick}>再生</button>
            <button onClick={onPauseButtonClick}>停止</button>
        </Base>
    );
}