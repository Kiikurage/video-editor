import * as React from 'react';
import { useRef } from 'react';
import styled from 'styled-components';
import { Caption } from '../model/Caption';
import { Project } from '../model/Project';
import { VideoController } from '../service/VideoController';
import { CaptionListView } from './CaptionListView';
import { DropArea } from './DropArea';
import { VideoPlayer } from './VideoPlayer';

const Base = styled.div`
    background: #fafafa;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template:
        'header header' auto
        'videoColumn captionListColumn' 1fr / auto 1fr;
`;

const AppHeader = styled.header`
    grid-area: header;
    padding: 16px 16px;
    display: flex;
    justify-content: space-between;
    min-height: 64px;
    box-sizing: border-box;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 1;
`;

const VideoPlayerColumn = styled.div`
    grid-area: videoColumn;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: stretch;
    position: relative;
    flex: 0 auto;
    gap: 16px;
    background: #fafafa;
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 360px;
`;

const CaptionListColumn = styled.div`
    grid-area: captionListColumn;
    position: relative;
    flex: 1 1 0;
    padding: 16px;
    overflow-y: auto;
    max-height: 100%;
`;

interface Props {
    videoController: VideoController;
    project: Project;
    onVideoOpen: (inputVideoPath: string) => void;
    onVideoExportButtonClick: () => void;
    onCaptionFocus: (caption: Caption) => void;
    onCaptionChange: (oldValue: Caption, newValue: Caption) => void;
    onAddCaptionButtonClick: () => void;
    onCaptionRemoveButtonClick: (caption: Caption) => void;
}

export function AppShell(props: Props): React.ReactElement {
    const {
        videoController,
        project,
        onVideoExportButtonClick,
        onCaptionFocus,
        onCaptionChange,
        onCaptionRemoveButtonClick,
        onAddCaptionButtonClick,
    } = props;

    const inputVideoFileInputRef = useRef<HTMLInputElement | null>(null);

    const onVideoOpenButtonClick = () => {
        const fileInput = inputVideoFileInputRef.current;
        if (fileInput === null || !fileInput.files || fileInput.files.length === 0) return;

        const file = fileInput.files[0];

        props.onVideoOpen(file.path);
    };

    const onFileDrop = (file: File) => {
        props.onVideoOpen(file.path);
    };

    return (
        <DropArea onFileDrop={onFileDrop}>
            <Base>
                <AppHeader>
                    <div>
                        <input type="file" accept=".mp4" ref={(e) => (inputVideoFileInputRef.current = e)} />
                        <button onClick={onVideoOpenButtonClick}>動画を開く</button>
                    </div>
                    <button onClick={onVideoExportButtonClick}>動画出力</button>
                </AppHeader>
                <VideoPlayerColumn>
                    <VideoPlayer project={project} videoController={videoController} />
                </VideoPlayerColumn>
                <CaptionListColumn>
                    <CaptionListView
                        videoController={videoController}
                        project={project}
                        currentVideoTimeInMS={videoController.currentTimeInMS}
                        onCaptionFocus={onCaptionFocus}
                        onCaptionChange={onCaptionChange}
                        onAddCaptionButtonClick={onAddCaptionButtonClick}
                        onCaptionRemoveButtonClick={onCaptionRemoveButtonClick}
                    />
                </CaptionListColumn>
            </Base>
        </DropArea>
    );
}
