import { useRef } from 'react';
import * as React from 'react';
import styled from 'styled-components';
import { BaseObject } from '../model/BaseObject';
import { Project } from '../model/Project';
import { PreviewController } from '../service/PreviewController';
import { DropArea } from './DropArea';
import { PropertyView } from './PropertyView';
import { TimeLine } from './TimeLine';
import { PreviewPlayer } from './PreviewPlayer';

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
    previewController: PreviewController;
    project: Project;
    selectedObject: BaseObject | null;
    onVideoOpen: (inputVideoPath: string) => void;
    onObjectSelect: (object: BaseObject) => void;
    onObjectAdd: (object: BaseObject) => void;
    onObjectChange: (oldValue: BaseObject, newValue: BaseObject) => void;
    onObjectRemove: (object: BaseObject) => void;
    onVideoExportButtonClick: () => void;
}

export function AppShell(props: Props): React.ReactElement {
    const {
        previewController,
        project,
        selectedObject,
        onObjectSelect,
        // onObjectAdd,
        // onObjectChange,
        onObjectRemove,
        onVideoExportButtonClick,
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

    const onPlayButtonClick = () => {
        previewController.play();
    };

    const onPauseButtonClick = () => {
        previewController.pause();
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
                <VideoPlayerArea>
                    <PreviewPlayer project={project} previewController={previewController} />
                </VideoPlayerArea>
                <MiddleToolbarArea>
                    <button onClick={onPlayButtonClick}>再生</button>
                    <button onClick={onPauseButtonClick}>停止</button>
                </MiddleToolbarArea>
                <CaptionListArea>
                    <TimeLine
                        previewController={previewController}
                        project={project}
                        selectedObject={selectedObject}
                        onObjectSelect={onObjectSelect}
                    />
                </CaptionListArea>

                <PropertyArea>
                    <PropertyView object={selectedObject} onObjectRemove={onObjectRemove} />
                </PropertyArea>
            </Base>
        </DropArea>
    );
}
