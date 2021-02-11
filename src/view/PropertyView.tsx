import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { convertColorFromPixiToDOM } from '../lib/convertColorFromPixiToDOM';
import { formatTime } from '../lib/formatTime';
import { assert } from '../lib/util';
import { AudioObject } from '../model/objects/AudioObject';
import { BaseObject } from '../model/objects/BaseObject';
import { FontStyle } from '../model/objects/FontStyle';
import { TextObject } from '../model/objects/TextObject';
import { ImageObject } from '../model/objects/ImageObject';
import { VideoObject } from '../model/objects/VideoObject';
import { Project } from '../model/Project';
import { AppController } from '../service/AppController';
import { useAppController } from './AppControllerProvider';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useThrottledForceUpdate } from './hooks/useThrottledForceUpdate';
import LockedIcon from '../icons/lock-24px.svg';
import UnlockedIcon from '../icons/lock_open-24px.svg';
import { convertColorFromDOMToPixi } from '../lib/convertColorFromDOMToPixi';

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
    line-height: 1;
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

                    <ProjectPropertyGroup appController={appController} project={project} />
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
                        {TextObject.isText(selectedObject) && (
                            <FontStylePropertyGroup appController={appController} object={selectedObject} />
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

function ProjectPropertyGroup(props: { appController: AppController; project: Project }): React.ReactElement {
    const { appController, project } = props;

    const onProjectFPSChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(ev.target.value);

        appController.setProject({ ...project, fps: value, isSaved: false });
    });
    const onProjectViewportWidthChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(ev.target.value);

        appController.setProject({ ...project, viewport: { ...project.viewport, width: value }, isSaved: false });
    });
    const onProjectViewportHeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(ev.target.value);
        appController.setProject({ ...project, viewport: { ...project.viewport, height: value }, isSaved: false });
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>プロジェクト設定</PropertyGroupName>
            <PropertyRow>
                <PropertyName>FPS</PropertyName>
                <input type="number" min={1} max={60} value={project.fps} onChange={onProjectFPSChange} />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>幅</PropertyName>
                <input type="number" min={0} max={1960} value={project.viewport.width} onChange={onProjectViewportWidthChange} />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>高さ</PropertyName>
                <input type="number" min={0} max={1080} value={project.viewport.height} onChange={onProjectViewportHeightChange} />
            </PropertyRow>
        </PropertyGroup>
    );
}

function BasePropertyGroup<T extends BaseObject>(props: { appController: AppController; object: T }): React.ReactElement {
    const { appController, object } = props;

    const onToggleLockButtonClick = useCallbackRef(() => {
        appController.commitHistory(() => {
            appController.updateObject({
                ...object,
                locked: !object.locked,
            });
        });
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>一般</PropertyGroupName>
            <PropertyRow>
                <PropertyName>開始</PropertyName>
                <span>{formatTime(object.startInMS, appController.project.fps)}</span>
            </PropertyRow>
            <PropertyRow>
                <PropertyName>終了</PropertyName>
                <span>{formatTime(object.endInMS, appController.project.fps)}</span>
            </PropertyRow>
            <PropertyRow>
                <PropertyName>編集ロック</PropertyName>
                <button onClick={onToggleLockButtonClick}>{object.locked ? <LockedIcon /> : <UnlockedIcon />}</button>
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
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, x: value });
        });
    });
    const onYChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, y: value });
        });
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>位置</PropertyGroupName>
            <PropertyRow>
                <PropertyName>X</PropertyName>
                <input type="number" min={0} value={object.x} onChange={onXChange} readOnly={object.locked} />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>Y</PropertyName>
                <input type="number" min={0} value={object.y} onChange={onYChange} readOnly={object.locked} />
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
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, width: value });
        });
    });
    const onHeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, height: value });
        });
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>サイズ</PropertyGroupName>
            <PropertyRow>
                <PropertyName>幅</PropertyName>
                <input type="number" min={0} value={object.width} onChange={onWidthChange} readOnly={object.locked} />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>高さ</PropertyName>
                <input type="number" min={0} value={object.height} onChange={onHeightChange} readOnly={object.locked} />
            </PropertyRow>
        </PropertyGroup>
    );
}

function FontStylePropertyGroup<T extends BaseObject & { fontStyle: FontStyle }>(props: {
    appController: AppController;
    object: T;
}): React.ReactElement {
    const { appController, object } = props;
    const onFontFamilyChange = useCallbackRef((ev: React.ChangeEvent<HTMLSelectElement>) => {
        const value = ev.target.value;
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, fontFamily: value } });
        });
    });
    const onFontWeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLSelectElement>) => {
        const value = ev.target.value;
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, fontWeight: value } });
        });
    });
    const onFillChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertColorFromDOMToPixi(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, fill: value } });
        });
    });
    const onStrokeChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertColorFromDOMToPixi(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, stroke: value } });
        });
    });
    const onStrokeThicknessChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(ev.target.value);
        appController.commitHistory(() => {
            appController.updateObject({ ...object, fontStyle: { ...object.fontStyle, strokeThickness: value } });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyGroupName>フォント</PropertyGroupName>
            <PropertyRow>
                <PropertyName>フォントの種類</PropertyName>
                <select defaultValue={object.fontStyle.fontSize} disabled={object.locked} onChange={onFontFamilyChange}>
                    <option value="Noto Sans JP">Noto Sans JP</option>
                </select>
            </PropertyRow>
            <PropertyRow>
                <PropertyName>太さ</PropertyName>
                <select defaultValue={object.fontStyle.fontWeight} disabled={object.locked} onChange={onFontWeightChange}>
                    <option value="100">100</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                    <option value="700">700</option>
                    <option value="900">900</option>
                </select>
            </PropertyRow>
            <PropertyRow>
                <PropertyName>色</PropertyName>
                <input
                    type="color"
                    defaultValue={convertColorFromPixiToDOM(object.fontStyle.fill)}
                    readOnly={object.locked}
                    onChange={onFillChange}
                />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>縁取りの色</PropertyName>
                <input
                    type="color"
                    defaultValue={convertColorFromPixiToDOM(object.fontStyle.stroke)}
                    readOnly={object.locked}
                    onChange={onStrokeChange}
                />
            </PropertyRow>
            <PropertyRow>
                <PropertyName>縁取りの太さ</PropertyName>
                <input
                    type="number"
                    defaultValue={object.fontStyle.strokeThickness}
                    readOnly={object.locked}
                    onChange={onStrokeThicknessChange}
                />
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
                <Textarea rows={5} defaultValue={object.text} onChange={onTextChange} readOnly={object.locked} />
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
                <input type="number" defaultValue={object.volume} min={0} max={1} onChange={onVolumeChange} readOnly={object.locked} />
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

        appController.commitHistory(() => {
            appController.updateObject({ ...object, srcFilePath: files[0].path });
        });
    });

    return (
        <PropertyGroup key={object.id}>
            <PropertyRow>
                <PropertyName>元ファイル</PropertyName>
                <input type="file" onChange={onFileChange} readOnly={object.locked} />
            </PropertyRow>
        </PropertyGroup>
    );
}
