import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { useAppController } from './AppControllerProvider';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useThrottledForceUpdate } from './hooks/useThrottledForceUpdate';

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
    onAddNewVideo: () => void;
    onAddNewImage: () => void;
    onAddNewCaption: () => void;
    onAddNewAudio: () => void;
}

export function MiddleToolBar(props: Props): React.ReactElement {
    const { previewController } = useAppController();
    const { onAddNewVideo, onAddNewImage, onAddNewCaption, onAddNewAudio } = props;
    const forceUpdate = useThrottledForceUpdate();

    const onPlayButtonClick = useCallbackRef((ev: React.MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
        previewController.play();
    });
    const onPauseButtonClick = useCallbackRef((ev: React.MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
        previewController.pause();
    });

    useEffect(() => {
        previewController.on('play', forceUpdate);
        previewController.on('pause', forceUpdate);

        return () => {
            previewController.off('play', forceUpdate);
            previewController.off('pause', forceUpdate);
        };
    }, [previewController, forceUpdate]);

    return (
        <Base>
            <div>
                {previewController.paused ? (
                    <button onClick={onPlayButtonClick}>再生</button>
                ) : (
                    <button onClick={onPauseButtonClick}>停止</button>
                )}
            </div>
            <div>
                <button onClick={onAddNewVideo}>動画を追加</button>
                <button onClick={onAddNewImage}>画像を追加</button>
                <button onClick={onAddNewAudio}>音声を追加</button>
                <button onClick={onAddNewCaption}>字幕を追加</button>
            </div>
        </Base>
    );
}
