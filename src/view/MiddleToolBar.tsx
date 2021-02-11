import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { formatTime } from '../lib/formatTime';
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

const PreviewPosition = styled.span``;

interface Props {
    onAddNewText: () => void;
    onAddNewAsset: () => void;
}

export function MiddleToolBar(props: Props): React.ReactElement {
    const { previewController, project } = useAppController();
    const { onAddNewAsset, onAddNewText } = props;
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
        previewController.on('tick', forceUpdate);
        previewController.on('seek', forceUpdate);

        return () => {
            previewController.off('play', forceUpdate);
            previewController.off('pause', forceUpdate);
            previewController.off('tick', forceUpdate);
            previewController.off('seek', forceUpdate);
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
                <PreviewPosition>{formatTime(previewController.currentTimeInMS, project.fps)}</PreviewPosition>
            </div>
            <div>
                <button onClick={onAddNewAsset}>素材を追加</button>
                <button onClick={onAddNewText}>テキストを追加</button>
            </div>
        </Base>
    );
}
