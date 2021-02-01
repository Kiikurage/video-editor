import * as React from 'react';
import styled from 'styled-components';
import { UUID } from '../lib/UUID';
import { BaseObject } from '../model/BaseObject';
import { ImageObject } from '../model/ImageObject';
import { Project } from '../model/Project';
import { VideoObject } from '../model/VideoObject';
import { PreviewController } from '../service/PreviewController';
import { DropArea } from './DropArea';
import { MiddleToolBar } from './MiddleToolBar';
import { PreviewPlayer } from './PreviewPlayer';
import { PropertyView } from './PropertyView';
import { TimeLine } from './TimeLine';

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
        'previewArea propertyArea' 500px
        'middleToolBarArea propertyArea' auto
        'timeLineArea propertyArea' 1fr / minmax(0, 1fr) 300px;
`;

const AppHeader = styled.header`
    grid-area: header;
    padding: 4px 32px;
    display: flex;
    justify-content: space-between;
    min-height: 32px;
    box-sizing: border-box;
    background: #fff;
    border-bottom: 1px solid #c0c0c0;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.05);
    z-index: 1;
`;

const PreviewArea = styled.div`
    grid-area: previewArea;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const MiddleToolbarArea = styled.div`
    grid-area: middleToolBarArea;
    position: relative;
`;

const TimeLineArea = styled.div`
    grid-area: timeLineArea;
    position: relative;
    flex: 1 1 0;
    overflow-x: auto;
    overflow-y: auto;
`;

const PropertyArea = styled.div`
    grid-area: propertyArea;
`;

interface Props {
    previewController: PreviewController;
    project: Project;
    selectedObject: BaseObject | null;
    onVideoOpen: (inputVideoPath: string) => void;
    onObjectSelect: (object: BaseObject | null) => void;
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
        onObjectAdd,
        onObjectChange,
        onObjectRemove,
        onVideoExportButtonClick,
    } = props;

    const onFileDrop = (file: File) => {
        let newObject: BaseObject;
        const fileType = file.type.split('/');

        switch (fileType[0]) {
            case 'video':
                newObject = {
                    type: 'VIDEO',
                    id: UUID(),
                    srcFilePath: file.path,
                    startInMS: previewController.currentTimeInMS,
                    endInMS: previewController.currentTimeInMS + 10000,
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 400,
                } as VideoObject;
                break;

            case 'image':
                newObject = {
                    type: 'IMAGE',
                    id: UUID(),
                    srcFilePath: file.path,
                    startInMS: previewController.currentTimeInMS,
                    endInMS: previewController.currentTimeInMS + 10000,
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 400,
                } as ImageObject;
                break;

            default:
                return;
        }

        onObjectAdd(newObject);
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
                    <button onClick={onVideoExportButtonClick}>動画出力</button>
                </AppHeader>
                <PreviewArea>
                    <PreviewPlayer
                        project={project}
                        selectedObject={selectedObject}
                        previewController={previewController}
                        onObjectSelect={onObjectSelect}
                    />
                </PreviewArea>
                <MiddleToolbarArea>
                    <MiddleToolBar onPlayButtonClick={onPlayButtonClick} onPauseButtonClick={onPauseButtonClick} />
                </MiddleToolbarArea>
                <TimeLineArea>
                    <TimeLine
                        previewController={previewController}
                        project={project}
                        selectedObject={selectedObject}
                        onObjectSelect={onObjectSelect}
                        onObjectUpdate={onObjectChange}
                    />
                </TimeLineArea>

                <PropertyArea>
                    <PropertyView object={selectedObject} onObjectChange={onObjectChange} onObjectRemove={onObjectRemove} />
                </PropertyArea>
            </Base>
        </DropArea>
    );
}
