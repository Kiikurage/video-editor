import * as React from 'react';
import styled from 'styled-components';

const Base = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: #f0f0f0;
    border-top: 1px solid #c0c0c0;
    border-bottom: 1px solid #c0c0c0;
    padding: 4px 32px;
    min-height: 32px;

    > div {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 16px;
    }
`;

interface Props {
    onPlayButtonClick: () => void;
    onPauseButtonClick: () => void;
    onAddVideoButtonClick: () => void;
    onAddImageButtonClick: () => void;
    onAddCaptionButtonClick: () => void;
}

export function MiddleToolBar(props: Props): React.ReactElement {
    const { onPauseButtonClick, onPlayButtonClick, onAddVideoButtonClick, onAddImageButtonClick, onAddCaptionButtonClick } = props;
    return (
        <Base>
            <div>
                <button onClick={onPlayButtonClick}>再生</button>
                <button onClick={onPauseButtonClick}>停止</button>
            </div>
            <div>
                <button onClick={onAddVideoButtonClick}>動画を追加</button>
                <button onClick={onAddImageButtonClick}>画像を追加</button>
                <button onClick={onAddCaptionButtonClick}>字幕を追加</button>
            </div>
        </Base>
    );
}
