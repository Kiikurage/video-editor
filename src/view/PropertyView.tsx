import { useEffect } from 'react';
import * as React from 'react';
import styled from 'styled-components';
import { CaptionObject } from '../model/objects/CaptionObject';
import { VideoObject } from '../model/objects/VideoObject';
import { useAppController } from './AppControllerProvider';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useThrottledForceUpdate } from './hooks/useThrottledForceUpdate';

const Base = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    border-left: 1px solid #c0c0c0;
    background: #fff;
`;

const Body = styled.div`
    overflow: auto;
    flex: 1 1 0;
`;

const PropertyGroup = styled.div`
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    justify-content: stretch;

    & + & {
        border-top: 1px solid #c0c0c0;
    }
`;

const PropertyGroupName = styled.header`
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.1em;
    color: #888;
`;

const PropertyRow = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
`;

const PropertyName = styled.header`
    font-size: 12px;
    color: #444;
`;

const ObjectSummary = styled.div`
    padding: 16px 24px;
`;

const Footer = styled.footer`
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 16px 24px;
    border-top: 1px solid #c0c0c0;
`;

const DeleteButton = styled.button`
    flex: 1;
    padding: 0 16px;
    line-height: 40px;
    background: #c00;
    color: #fff;
    border: none;
    cursor: pointer;
`;

export function PropertyView(): React.ReactElement {
    const appController = useAppController();

    const forceUpdate = useThrottledForceUpdate();
    useEffect(() => {
        appController.on('project.change', forceUpdate);
        appController.on('object.select', forceUpdate);

        return () => {
            appController.off('project.change', forceUpdate);
            appController.off('object.select', forceUpdate);
        };
    }, [appController, forceUpdate]);

    const project = appController.project;
    const selectedObject = appController.selectedObject;
    const onProjectFPSChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedObject !== null) return;
        const value = Number(ev.target.value);

        appController.setProject({ ...project, fps: value });
    });
    const onProjectViewportWidthChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedObject !== null) return;
        const value = Number(ev.target.value);

        appController.setProject({ ...project, viewport: { ...project.viewport, width: value } });
    });
    const onProjectViewportHeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedObject !== null) return;
        const value = Number(ev.target.value);
        appController.setProject({ ...project, viewport: { ...project.viewport, height: value } });
    });

    const onObjectRemove = useCallbackRef(() => {
        if (selectedObject !== null) {
            appController.removeObject(selectedObject.id);
        }
    });

    const onStartInMSChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedObject === null) return;
        const value = Number(ev.target.value);
        appController.updateObject({ ...selectedObject, startInMS: value });
    });
    const onEndInMSChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedObject === null) return;
        const value = Number(ev.target.value);
        appController.updateObject({ ...selectedObject, endInMS: value });
    });
    const onXChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedObject === null) return;
        const value = Number(ev.target.value);
        appController.updateObject({ ...selectedObject, x: value });
    });
    const onYChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedObject === null) return;
        const value = Number(ev.target.value);
        appController.updateObject({ ...selectedObject, y: value });
    });
    const onWidthChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedObject === null) return;
        const value = Number(ev.target.value);
        appController.updateObject({ ...selectedObject, width: value });
    });
    const onHeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedObject === null) return;
        const value = Number(ev.target.value);
        appController.updateObject({ ...selectedObject, height: value });
    });
    const onCaptionTextChange = useCallbackRef((ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedObject === null) return;
        const value = ev.target.value;
        appController.updateObject({ ...selectedObject, text: value } as CaptionObject);
    });

    return (
        <Base>
            {selectedObject === null ? (
                <Body>
                    <ObjectSummary>
                        <div>PROJECT</div>
                    </ObjectSummary>

                    <PropertyGroup>
                        <PropertyGroupName>プロジェクト設定</PropertyGroupName>
                        <PropertyRow>
                            <PropertyName>FPS</PropertyName>
                            <input type="number" min={1} max={60} value={project.fps} onChange={onProjectFPSChange} />
                        </PropertyRow>
                        <PropertyRow>
                            <PropertyName>幅</PropertyName>
                            <input
                                type="number"
                                min={0}
                                max={1960}
                                value={project.viewport.width}
                                onChange={onProjectViewportWidthChange}
                            />
                        </PropertyRow>
                        <PropertyRow>
                            <PropertyName>高さ</PropertyName>
                            <input
                                type="number"
                                min={0}
                                max={1080}
                                value={project.viewport.height}
                                onChange={onProjectViewportHeightChange}
                            />
                        </PropertyRow>
                    </PropertyGroup>
                </Body>
            ) : (
                <>
                    <Body>
                        <ObjectSummary>
                            <div>{selectedObject.type}</div>
                        </ObjectSummary>

                        <PropertyGroup>
                            <PropertyGroupName>一般</PropertyGroupName>
                            <PropertyRow>
                                <PropertyName>開始</PropertyName>
                                <input type="number" min={0} value={selectedObject.startInMS} onChange={onStartInMSChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>終了</PropertyName>
                                <input type="number" min={0} value={selectedObject.endInMS} onChange={onEndInMSChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>X</PropertyName>
                                <input type="number" min={0} value={selectedObject.x} onChange={onXChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>Y</PropertyName>
                                <input type="number" min={0} value={selectedObject.y} onChange={onYChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>幅</PropertyName>
                                <input type="number" min={0} value={selectedObject.width} onChange={onWidthChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>高さ</PropertyName>
                                <input type="number" min={0} value={selectedObject.height} onChange={onHeightChange} />
                            </PropertyRow>
                        </PropertyGroup>
                        {CaptionObject.isCaption(selectedObject) && (
                            <PropertyGroup>
                                <PropertyGroupName>字幕</PropertyGroupName>
                                <PropertyRow>
                                    <PropertyName>内容</PropertyName>
                                    <textarea value={selectedObject.text} onChange={onCaptionTextChange} />
                                </PropertyRow>
                            </PropertyGroup>
                        )}
                        {VideoObject.isVideo(selectedObject) && (
                            <PropertyGroup>
                                <PropertyGroupName>動画</PropertyGroupName>
                                <PropertyRow>
                                    <PropertyName>元ファイル</PropertyName>
                                    <input type="text" value={selectedObject.srcFilePath} />
                                </PropertyRow>
                            </PropertyGroup>
                        )}
                    </Body>

                    <Footer>
                        <DeleteButton onClick={onObjectRemove}>削除</DeleteButton>
                    </Footer>
                </>
            )}
        </Base>
    );
}
