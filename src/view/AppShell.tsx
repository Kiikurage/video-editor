import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { showOpenFileDialog } from '../ipc/renderer/showOpenFileDialog';
import { assert } from '../lib/util';
import { UUID } from '../lib/UUID';
import { ShapeObject } from '../model/objects/ShapeObject';
import { TextObject } from '../model/objects/TextObject';
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
    const [timelineAreaHeight, setTimelineAreaHeight] = useState(200);
    const [propertyAreaWidth, setPropertyAreaWidth] = useState(240);
    const appController = useAppController();

    const onFileDrop = useCallbackRef((file: File) => {
        void appController.importAssetFromFile(file.path);
    });

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
            text: 'テキスト',
            locked: false,
            fontStyle: {
                fontFamily: 'Noto Sans JP',
                fontSize: 80,
                fontWeight: '900',
                fill: 0x000000,
                stroke: 0xffffff,
                strokeThickness: 0,
            },
        };
        appController.commitHistory(() => {
            appController.addObject(object);
        });
    });

    const onAddNewAsset = useCallbackRef(async () => {
        const { canceled, filePaths } = await showOpenFileDialog();
        if (canceled) return;
        assert(filePaths.length === 1, "Multi-file import isn't supported");

        void appController.importAssetFromFile(filePaths[0]);
    });

    const onAddNewShape = useCallbackRef(() => {
        const currentTimeInMS = appController.previewController.currentTimeInMS;
        const object: ShapeObject = {
            id: UUID(),
            type: ShapeObject.type,
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            startInMS: currentTimeInMS,
            endInMS: currentTimeInMS + 5000,
            locked: false,
            shapeType: 'RECTANGLE',
            anchor: [],
            fill: 0xffffff,
            stroke: 0x000000,
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
                                        onAddNewAsset={onAddNewAsset}
                                        onAddNewShape={onAddNewShape}
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
