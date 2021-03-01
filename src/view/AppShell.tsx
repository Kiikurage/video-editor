import * as React from 'react';
import { useRef } from 'react';
import styled from 'styled-components';
import { useAppController } from './AppControllerProvider';
import { AppToolbar } from './AppToolbar';
import { DropArea } from './DropArea';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useForceUpdate } from './hooks/useForceUpdate';
import { PreviewPlayer } from './PreviewPlayer/PreviewPlayer';
import { PropertyPane } from './PropertyPane';
import { SceneListPane } from './SceneListPane';
import { SnackBarList } from './SnackBarList';
import { SplitPane, Splitter } from './SplitPane';
import { TimelinePane } from './TimelinePane';

const Base = styled.div`
    background: #a0a0a0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    user-select: none;
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hiragino Sans', 'Noto Sans CJK JP', 'Original Yu Gothic',
        'Yu Gothic', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Sans Emoji';
`;

const AppToolbarArea = styled.div``;

const BodyArea = styled.div`
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
    min-height: 0;
    min-width: 0;
    flex: 1 1 0;

    > * {
        width: 100%;
    }
`;

const LeftPaneArea = styled.div`
    flex: 0 0 auto;
    border-right: 1px solid #a0a0a0;
    width: var(--AppShell-leftPaneWidth);
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

const RightArea = styled.div`
    flex: 0 0 auto;
    border-left: 1px solid #a0a0a0;
`;

const BottomArea = styled.div`
    position: relative;
    overflow-x: auto;
    overflow-y: auto;
    flex: 0 0 auto;
    border-top: 1px solid #a0a0a0;
`;

export function AppShell(): React.ReactElement {
    const bottomAreaHeightRef = useRef(240);
    const leftAreaWidthRef = useRef(0);
    const rightAreaWidthRef = useRef(240);
    const appController = useAppController();
    const forceUpdate = useForceUpdate();

    const onBottomAreaHeightChange = useCallbackRef((dx: number, dy: number) => {
        bottomAreaHeightRef.current -= dy;
        forceUpdate();
    });
    const onLeftAreaWidthChange = useCallbackRef((dx: number) => {
        leftAreaWidthRef.current += dx;
        forceUpdate();
    });
    const onRightAreaWidthChange = useCallbackRef((dx: number) => {
        rightAreaWidthRef.current -= dx;
        forceUpdate();
    });

    const onFileDrop = useCallbackRef((file: File) => {
        void appController.importAssetFromFile(file.path);
    });

    return (
        <DropArea onFileDrop={onFileDrop}>
            <Base>
                <AppToolbarArea>
                    <AppToolbar />
                </AppToolbarArea>
                <BodyArea>
                    <SplitPane direction="column">
                        <MainArea>
                            <SplitPane direction="row">
                                <LeftPaneArea style={{ width: leftAreaWidthRef.current }}>
                                    <SceneListPane />
                                </LeftPaneArea>

                                <Splitter onChange={onLeftAreaWidthChange} />

                                <PreviewArea>
                                    <PreviewPlayer />
                                </PreviewArea>

                                <Splitter onChange={onRightAreaWidthChange} />

                                <RightArea style={{ width: rightAreaWidthRef.current }}>
                                    <PropertyPane />
                                </RightArea>
                            </SplitPane>
                        </MainArea>

                        <Splitter onChange={onBottomAreaHeightChange} />

                        <BottomArea style={{ height: bottomAreaHeightRef.current }}>
                            <TimelinePane />
                        </BottomArea>
                    </SplitPane>
                </BodyArea>

                <SnackBarList />
            </Base>
        </DropArea>
    );
}
