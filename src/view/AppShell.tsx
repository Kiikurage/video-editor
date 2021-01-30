import * as React from 'react';
import styled from 'styled-components';
import { Caption } from '../model/Caption';
import { Project } from '../model/Project';
import { VideoController } from '../service/VideoController';
import { DropArea } from './DropArea';
import { TimeLine } from './TimeLine';
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
        'previewArea propertyArea' 300px
        'middleToolBarArea propertyArea' auto
        'captionListArea propertyArea' 1fr / auto 300px;
`;

const AppHeader = styled.header`
    grid-area: header;
    padding: 4px 32px;
    display: flex;
    justify-content: space-between;
    min-height: 32px;
    box-sizing: border-box;
    background: #e8e8e8;
    border-bottom: 1px solid #c0c0c0;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.05);
    z-index: 1;
`;

const VideoPlayerArea = styled.div`
    grid-area: previewArea;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    flex: 0 auto;
    gap: 16px;
    background: #000;
    border-bottom: 1px solid #c0c0c0;
`;

const MiddleToolbarArea = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: #f0f0f0;
    border-bottom: 1px solid #c0c0c0;
    padding: 4px 32px;
    min-height: 32px;
`;

const CaptionListArea = styled.div`
    grid-area: captionListArea;
    position: relative;
    flex: 1 1 0;
    overflow-y: auto;
    max-height: 100%;
    background: #fff;
`;

const PropertyArea = styled.div`
    grid-area: propertyArea;
    border-left: 1px solid #c0c0c0;
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
        // onVideoExportButtonClick,
        // onCaptionFocus,
        // onCaptionChange,
        // onCaptionRemoveButtonClick,
        // onAddCaptionButtonClick,
    } = props;

    // const inputVideoFileInputRef = useRef<HTMLInputElement | null>(null);

    // const onVideoOpenButtonClick = () => {
    //     const fileInput = inputVideoFileInputRef.current;
    //     if (fileInput === null || !fileInput.files || fileInput.files.length === 0) return;
    //
    //     const file = fileInput.files[0];
    //
    //     props.onVideoOpen(file.path);
    // };

    const onFileDrop = (file: File) => {
        props.onVideoOpen(file.path);
    };

    const onPlayButtonClick = () => {
        videoController.play();
    };

    const onPauseButtonClick = () => {
        videoController.pause();
    };

    return (
        <DropArea onFileDrop={onFileDrop}>
            <Base>
                <AppHeader>
                    {/*<div>*/}
                    {/*    <input type="file" accept=".mp4" ref={(e) => (inputVideoFileInputRef.current = e)} />*/}
                    {/*    <button onClick={onVideoOpenButtonClick}>動画を開く</button>*/}
                    {/*</div>*/}
                    {/*<button onClick={onVideoExportButtonClick}>動画出力</button>*/}
                </AppHeader>
                <VideoPlayerArea>
                    <VideoPlayer project={project} videoController={videoController} />
                </VideoPlayerArea>
                <MiddleToolbarArea>
                    <button onClick={onPlayButtonClick}>再生</button>
                    <button onClick={onPauseButtonClick}>停止</button>
                </MiddleToolbarArea>
                <CaptionListArea>
                    <TimeLine videoController={videoController} project={project} />
                    {/*<CaptionListView*/}
                    {/*    videoController={videoController}*/}
                    {/*    project={project}*/}
                    {/*    currentVideoTimeInMS={videoController.currentTimeInMS}*/}
                    {/*    onCaptionFocus={onCaptionFocus}*/}
                    {/*    onCaptionChange={onCaptionChange}*/}
                    {/*    onAddCaptionButtonClick={onAddCaptionButtonClick}*/}
                    {/*    onCaptionRemoveButtonClick={onCaptionRemoveButtonClick}*/}
                    {/*/>*/}
                </CaptionListArea>

                <PropertyArea></PropertyArea>
            </Base>
        </DropArea>
    );
}
