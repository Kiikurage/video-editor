import * as React from 'react';
import styled from 'styled-components';
import { showOpenFileDialog } from '../ipc/renderer/showOpenFileDialog';
import { assert } from '../lib/util';
import { ShapeObject } from '../model/objects/ShapeObject';
import { TextObject } from '../model/objects/TextObject';
import ShapesIcon from '../static/icons/category-24px.svg';
import OpenIcon from '../static/icons/folder_open-24px.svg';
import MediaIcon from '../static/icons/perm_media-24px.svg';
import PublishIcon from '../static/icons/publish-24px.svg';
import SaveIcon from '../static/icons/save-24px.svg';
import TextIcon from '../static/icons/title-24px.svg';
import { useAppController } from './AppControllerProvider';
import { useCallbackRef } from './hooks/useCallbackRef';

const Base = styled.header`
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    background: #fff;
    border-bottom: 1px solid #a0a0a0;
    width: 100%;
`;

const ItemGroup = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
`;

const Button = styled.button`
    background: none;
    border: none;
    line-height: 1;
    margin: 4px 0;
    padding: 4px 8px;
    border-radius: 2px;
    pointer-events: all;
    height: 32px;
    min-width: 32px;
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

export function AppToolbar(): React.ReactElement {
    const appController = useAppController();

    const onAddNewText = useCallbackRef(() => {
        const currentTimeInMS = appController.currentTimeInMS;
        appController.commitHistory(() => {
            appController.addObject(new TextObject({ startInMS: currentTimeInMS, endInMS: currentTimeInMS + 5000 }));
        });
    });

    const onAddNewAsset = useCallbackRef(async () => {
        const { canceled, filePaths } = await showOpenFileDialog();
        if (canceled) return;
        assert(filePaths.length === 1, "Multi-file import isn't supported");

        void appController.importAssetFromFile(filePaths[0]);
    });

    const onAddNewShape = useCallbackRef((shapeType: string) => {
        const currentTimeInMS = appController.currentTimeInMS;
        appController.commitHistory(() => {
            appController.addObject(
                new ShapeObject({
                    startInMS: currentTimeInMS,
                    endInMS: currentTimeInMS + 5000,
                    shapeType: shapeType,
                })
            );
        });
    });

    return (
        <Base>
            <ItemGroup>
                <Button onClick={appController.saveProject}>
                    <SaveIcon width={20} height={20} /> 保存
                </Button>
                <Button onClick={appController.openProject}>
                    <OpenIcon width={20} height={20} /> 読み込み
                </Button>
                <Button onClick={onAddNewAsset}>
                    <MediaIcon width={16} height={16} />
                </Button>
                <Button onClick={onAddNewText}>
                    <TextIcon width={16} height={16} />
                </Button>
                <Button onClick={() => onAddNewShape('RECTANGLE')}>
                    <ShapesIcon width={16} height={16} />
                </Button>
                <Button onClick={() => onAddNewShape('CIRCLE')}>
                    <ShapesIcon width={16} height={16} />
                </Button>
            </ItemGroup>

            <ItemGroup>
                <Button onClick={appController.exportVideo}>
                    <PublishIcon width={20} height={20} /> 動画を出力
                </Button>
            </ItemGroup>
        </Base>
    );
}
