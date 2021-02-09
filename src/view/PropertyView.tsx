import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { assert } from '../lib/util';
import { AudioObject } from '../model/objects/AudioObject';
import { BaseObject } from '../model/objects/BaseObject';
import { TextObject } from '../model/objects/TextObject';
import { ImageObject } from '../model/objects/ImageObject';
import { VideoObject } from '../model/objects/VideoObject';
import { AppController } from '../service/AppController';
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

const Textarea = styled.textarea`
    resize: none;
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
            appController.commitHistory(() => {
                appController.removeObject(selectedObject.id);
            });
        }
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

                        <BasePropertyGroup appController={appController} object={selectedObject} />
                        {(VideoObject.isVideo(selectedObject) ||
                            TextObject.isText(selectedObject) ||
                            ImageObject.isImage(selectedObject)) && (
                            <PositionPropertyGroup appController={appController} object={selectedObject} />
                        )}
                        {(VideoObject.isVideo(selectedObject) ||
                            TextObject.isText(selectedObject) ||
                            ImageObject.isImage(selectedObject)) && (
                            <SizePropertyGroup appController={appController} object={selectedObject} />
                        )}
                        {TextObject.isText(selectedObject) && <TextPropertyGroup appController={appController} object={selectedObject} />}
                        {AudioObject.isAudio(selectedObject) && (
                            <AudioPropertyGroup appController={appController} object={selectedObject} />
                        )}
                        {(AudioObject.isAudio(selectedObject) ||
                            VideoObject.isVideo(selectedObject) ||
                            ImageObject.isImage(selectedObject)) && (
                            <SrcFilePropertyGroup appController={appController} object={selectedObject} />
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

function BasePropertyGroup<T extends BaseObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;

    return (
        <PropertyGroup>
            <PropertyGroupName>一般</PropertyGroupName>
            <PropertyRow>
                <PropertyName>開始</PropertyName>
                <span>{formatTimeByQuantization(object.startInMS, appController.project.fps)}</span>
            </PropertyRow>
            <PropertyRow>
                <PropertyName>終了</PropertyName>
                <span>{formatTimeByQuantization(object.endInMS, appController.project.fps)}</span>
            </PropertyRow>
        </PropertyGroup>
    );
}

function PositionPropertyGroup<T extends BaseObject & { x: number; y: number }>(props: {
    appController: AppController;
    object: T;
}): React.ReactElement {
    const { appController, object } = props;
    const onXChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, x: value });
        });
    });
    const onYChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, y: value });
        });
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>位置</PropertyGroupName>
            <PropertyRow>
                <PropertyName>X</PropertyName>
                <input type="number" min={0} value={object.x} onChange={onXChange} />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>Y</PropertyName>
                <input type="number" min={0} value={object.y} onChange={onYChange} />
            </PropertyRow>
        </PropertyGroup>
    );
}

function SizePropertyGroup<T extends BaseObject & { width: number; height: number }>(props: {
    appController: AppController;
    object: T;
}): React.ReactElement {
    const { appController, object } = props;
    const onWidthChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, width: value });
        });
    });
    const onHeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, height: value });
        });
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>サイズ</PropertyGroupName>
            <PropertyRow>
                <PropertyName>幅</PropertyName>
                <input type="number" min={0} value={object.width} onChange={onWidthChange} />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>高さ</PropertyName>
                <input type="number" min={0} value={object.height} onChange={onHeightChange} />
            </PropertyRow>
        </PropertyGroup>
    );
}

function TextPropertyGroup<T extends TextObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;
    const onTextChange = useCallbackRef((ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = ev.target.value;
        appController.commitHistory(() => {
            appController.updateObject({ ...object, text: value });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>字幕</PropertyGroupName>
            <PropertyRow>
                <PropertyName>内容</PropertyName>
                <Textarea rows={5} defaultValue={object.text} onChange={onTextChange} />
            </PropertyRow>
        </PropertyGroup>
    );
}

function AudioPropertyGroup<T extends AudioObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;
    const onVolumeChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(ev.target.value);
        assert(0 <= value && value <= 1, `Invalid volume value: ${value}`);

        appController.commitHistory(() => {
            appController.updateObject({ ...object, volume: value });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>音声</PropertyGroupName>
            <PropertyRow>
                <PropertyName>ボリューム</PropertyName>
                <input type="number" defaultValue={object.volume} min={0} max={1} onChange={onVolumeChange} />
            </PropertyRow>
        </PropertyGroup>
    );
}

function SrcFilePropertyGroup<T extends BaseObject & { srcFilePath: string }>(props: {
    appController: AppController;
    object: T;
}): React.ReactElement {
    const { appController, object } = props;
    const onFileChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const files = ev.target.files;
        if (files?.length !== 1) return;
        console.log(files[0].path);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, srcFilePath: files[0].path });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyRow>
                <PropertyName>元ファイル</PropertyName>
                <input type="file" onChange={onFileChange} />
            </PropertyRow>
        </PropertyGroup>
    );
}

function formatTimeByQuantization(timeInMS: number, fps: number): string {
    let rest = Math.floor(timeInMS);

    const millisecond = rest % 1000;
    rest = (rest - millisecond) / 1000;

    const second = rest % 60;
    rest = (rest - second) / 60;

    const minute = rest % 60;
    rest = (rest - minute) / 60;

    const hour = rest;

    const frame = Math.round((millisecond * fps) / 1000);

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second
        .toString()
        .padStart(2, '0')}.${frame.toString().padStart(2, '0')}`;
}
