import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { showOpenFileDialog } from '../ipc/renderer/showOpenFileDialog';
import { assert } from '../lib/util';
import { UUID } from '../lib/UUID';
import { AudioObject } from '../model/objects/AudioObject';
import { BaseObject } from '../model/objects/BaseObject';
import { ImageObject } from '../model/objects/ImageObject';
import { TextObject } from '../model/objects/TextObject';
import { VideoObject } from '../model/objects/VideoObject';
import { useAppController } from './AppControllerProvider';
import { DropArea } from './DropArea';
import { useCallbackRef } from './hooks/useCallbackRef';
import { MiddleToolBar } from './MiddleToolBar';
import { PreviewPlayer } from './PreviewPlayer';
import { PropertyView } from './PropertyView';
import { SnackBarList } from './SnackBarList';
import { SplitPane, Splitter } from './SplitPane';
import { TimeLine } from './TimeLine';

const Base = styled.div`
    background: #fafafa;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
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
    width: 100%;
`;

const BodyArea = styled.div`
    grid-area: bodyArea;
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    flex: 1;
    width: 100%;

    > * {
        width: 100%;
    }
`;

const MainArea = styled.div`
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    min-width: 0;
    flex: 1 1 0;

    > * {
        width: 100%;
    }
`;

const PreviewArea = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1 1 0;
    overflow: scroll scroll;
`;

const MiddleToolbarArea = styled.div`
    position: relative;
`;

const TimeLineArea = styled.div`
    position: relative;
    overflow-x: auto;
    overflow-y: auto;
    flex: 0 0 auto;
`;

const PropertyArea = styled.div`
    flex: 0 0 auto;
`;

export function AppShell(): React.ReactElement {
    const appController = useAppController();

    const onFileDrop = (file: File) => {
        let newObject: BaseObject;
        const fileType = file.type.split('/');

        switch (fileType[0]) {
            case 'video':
                newObject = {
                    type: VideoObject.type,
                    id: UUID(),
                    srcFilePath: file.path,
                    startInMS: appController.previewController.currentTimeInMS,
                    endInMS: appController.previewController.currentTimeInMS + 10000,
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 400,
                } as VideoObject;
                break;

            case 'image':
                newObject = {
                    type: ImageObject.type,
                    id: UUID(),
                    srcFilePath: file.path,
                    startInMS: appController.previewController.currentTimeInMS,
                    endInMS: appController.previewController.currentTimeInMS + 10000,
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 400,
                } as ImageObject;
                break;

            case 'audio':
                newObject = {
                    type: AudioObject.type,
                    id: UUID(),
                    srcFilePath: file.path,
                    startInMS: appController.previewController.currentTimeInMS,
                    endInMS: appController.previewController.currentTimeInMS + 10000,
                } as AudioObject;
                break;

            default:
                return;
        }

        appController.commitHistory(() => {
            appController.addObject(newObject);
        });
    };

    const [timelineAreaHeight, setTimelineAreaHeight] = useState(200);
    const [propertyAreaWidth, setPropertyAreaWidth] = useState(240);

    const onAddNewText = useCallbackRef(() => {
        const currentTimeInMS = appController.previewController.currentTimeInMS;
        const object: TextObject = {
            id: UUID(),
            type: TextObject.type,
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            startInMS: currentTimeInMS,
            endInMS: currentTimeInMS + 5000,
            text: '字幕',
        };
        appController.commitHistory(() => {
            appController.addObject(object);
        });
    });

    const onAddNewImage = useCallbackRef(async () => {
        const { canceled, filePaths } = await showOpenFileDialog();
        if (canceled) return;
        assert(filePaths.length === 1, "Multi-file import isn't supported");

        const currentTimeInMS = appController.previewController.currentTimeInMS;
        const object: ImageObject = {
            id: UUID(),
            type: ImageObject.type,
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            startInMS: currentTimeInMS,
            endInMS: currentTimeInMS + 5000,
            srcFilePath: filePaths[0],
        };
        appController.commitHistory(() => {
            appController.addObject(object);
        });
    });

    const onAddNewVideo = useCallbackRef(async () => {
        const { canceled, filePaths } = await showOpenFileDialog();
        if (canceled) return;
        assert(filePaths.length === 1, "Multi-file import isn't supported");

        const currentTimeInMS = appController.previewController.currentTimeInMS;
        const object: VideoObject = {
            id: UUID(),
            type: VideoObject.type,
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            startInMS: currentTimeInMS,
            endInMS: currentTimeInMS + 5000,
            srcFilePath: filePaths[0],
        };
        appController.commitHistory(() => {
            appController.addObject(object);
        });
    });

    const onAddNewAudio = useCallbackRef(async () => {
        const { canceled, filePaths } = await showOpenFileDialog();
        if (canceled) return;
        assert(filePaths.length === 1, "Multi-file import isn't supported");

        const currentTimeInMS = appController.previewController.currentTimeInMS;
        const object: AudioObject = {
            id: UUID(),
            type: AudioObject.type,
            startInMS: currentTimeInMS,
            endInMS: currentTimeInMS + 5000,
            srcFilePath: filePaths[0],
            volume: 0.5,
        };
        appController.commitHistory(() => {
            appController.addObject(object);
        });
    });

    return (
        <DropArea onFileDrop={onFileDrop}>
            <Base>
                <AppHeader>
                    <div>
                        <button onClick={appController.saveProject}>保存</button>
                        <button onClick={appController.openProject}>開く</button>
                    </div>
                    <button onClick={appController.exportVideo}>動画出力</button>
                </AppHeader>

                <BodyArea>
                    <SplitPane direction="row">
                        <MainArea>
                            <SplitPane direction="column">
                                <PreviewArea>
                                    <PreviewPlayer />
                                </PreviewArea>

                                <Splitter onChange={(_dx, dy) => setTimelineAreaHeight(timelineAreaHeight - dy)} />

                                <MiddleToolbarArea>
                                    <MiddleToolBar
                                        onAddNewText={onAddNewText}
                                        onAddNewImage={onAddNewImage}
                                        onAddNewVideo={onAddNewVideo}
                                        onAddNewAudio={onAddNewAudio}
                                    />
                                </MiddleToolbarArea>

                                <TimeLineArea style={{ height: timelineAreaHeight }}>
                                    <TimeLine />
                                </TimeLineArea>
                            </SplitPane>
                        </MainArea>

                        <Splitter onChange={(dx, _dy) => setPropertyAreaWidth(propertyAreaWidth - dx)} />

                        <PropertyArea style={{ width: propertyAreaWidth }}>
                            <PropertyView />
                        </PropertyArea>
                    </SplitPane>
                </BodyArea>

                <SnackBarList />
            </Base>
        </DropArea>
    );
}
