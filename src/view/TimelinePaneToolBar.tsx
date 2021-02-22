import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { formatTime } from '../lib/formatTime';
import PreviewStartIcon from '../static/icons/play_arrow-24px.svg';
import PreviewStopIcon from '../static/icons/stop-24px.svg';
import { useAppController } from './AppControllerProvider';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useForceUpdate } from './hooks/useForceUpdate';

const Base = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    background: #f0f0f0;
    padding: 4px 16px;
    height: 30px;
    box-sizing: border-box;
    border-bottom: 1px solid #e0e0e0;
    min-width: 160px;
`;

const Button = styled.button`
    background: none;
    border: none;
    padding: 0 8px;
    line-height: 1;
    min-width: 0;
    margin: 2px 0;
    border-radius: 2px;
    pointer-events: all;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    font-size: 12px;
    color: #444;
    fill: currentColor;

    &:hover {
        background: rgba(0, 0, 0, 0.08);
    }

    &:active {
        background: rgba(0, 0, 0, 0.2);
    }
`;

const IconButton = styled(Button)`
    min-width: 0;
    padding: 0;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    font-size: 12px;

    &:hover {
        background: rgba(0, 0, 0, 0.08);
    }

    &:active {
        background: rgba(0, 0, 0, 0.2);
    }
`;

const PreviewPosition = styled.span`
    font-family: monospace;
    font-size: 16px;
    font-weight: 100;
    color: #666;
`;

export function TimelinePaneToolBar(): React.ReactElement {
    const { previewController, project } = useAppController();
    const forceUpdate = useForceUpdate();

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
            {previewController.paused ? (
                <IconButton onClick={onPlayButtonClick}>
                    <PreviewStartIcon width={24} height={24} />
                </IconButton>
            ) : (
                <IconButton onClick={onPauseButtonClick}>
                    <PreviewStopIcon width={24} height={24} />
                </IconButton>
            )}
            <PreviewPosition>{formatTime(previewController.currentTimeInMS, project.fps)}</PreviewPosition>
        </Base>
    );
}
