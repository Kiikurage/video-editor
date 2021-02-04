import * as React from 'react';
import styled from 'styled-components';
import { BaseObject } from '../model/objects/BaseObject';
import { CaptionObject } from '../model/objects/CaptionObject';
import { VideoObject } from '../model/objects/VideoObject';
import { Project } from '../model/Project';
import { useCallbackRef } from './hooks/useCallbackRef';

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

interface Props {
    project: Project | null;
    object: BaseObject | null;
    onChangeProject: (oldValue: Project, newValue: Project) => void;
    onChangeObject: (oldValue: BaseObject, newValue: BaseObject) => void;
    onRemoveObject: (object: BaseObject) => void;
}

export function PropertyView(props: Props): React.ReactElement {
    const { project, object, onChangeProject, onChangeObject } = props;

    const onProjectFPSChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (project === null) return;
        const value = Number(ev.target.value);
        onChangeProject(project, { ...project, fps: value });
    });
    const onProjectViewportWidthChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (project === null) return;
        const value = Number(ev.target.value);
        onChangeProject(project, { ...project, viewport: { ...project.viewport, width: value } });
    });
    const onProjectViewportHeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (project === null) return;
        const value = Number(ev.target.value);
        onChangeProject(project, { ...project, viewport: { ...project.viewport, height: value } });
    });

    const onObjectRemove = useCallbackRef(() => {
        if (object !== null) {
            props.onRemoveObject(object);
        }
    });

    const onStartInMSChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (object === null) return;
        const value = Number(ev.target.value);
        onChangeObject(object, { ...object, startInMS: value });
    });
    const onEndInMSChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (object === null) return;
        const value = Number(ev.target.value);
        onChangeObject(object, { ...object, endInMS: value });
    });
    const onXChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (object === null) return;
        const value = Number(ev.target.value);
        onChangeObject(object, { ...object, x: value });
    });
    const onYChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (object === null) return;
        const value = Number(ev.target.value);
        onChangeObject(object, { ...object, y: value });
    });
    const onWidthChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (object === null) return;
        const value = Number(ev.target.value);
        onChangeObject(object, { ...object, width: value });
    });
    const onHeightChange = useCallbackRef((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (object === null) return;
        const value = Number(ev.target.value);
        onChangeObject(object, { ...object, height: value });
    });
    const onCaptionTextChange = useCallbackRef((ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (object === null) return;
        const value = ev.target.value;
        onChangeObject(object, { ...object, text: value } as CaptionObject);
    });

    return (
        <Base>
            {object !== null && (
                <>
                    <Body>
                        <ObjectSummary>
                            <div>{object.type}</div>
                        </ObjectSummary>

                        <PropertyGroup>
                            <PropertyGroupName>一般</PropertyGroupName>
                            <PropertyRow>
                                <PropertyName>開始</PropertyName>
                                <input type="number" min={0} value={object.startInMS} onChange={onStartInMSChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>終了</PropertyName>
                                <input type="number" min={0} value={object.endInMS} onChange={onEndInMSChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>X</PropertyName>
                                <input type="number" min={0} value={object.x} onChange={onXChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>Y</PropertyName>
                                <input type="number" min={0} value={object.y} onChange={onYChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>幅</PropertyName>
                                <input type="number" min={0} value={object.width} onChange={onWidthChange} />
                            </PropertyRow>
                            <PropertyRow>
                                <PropertyName>高さ</PropertyName>
                                <input type="number" min={0} value={object.height} onChange={onHeightChange} />
                            </PropertyRow>
                        </PropertyGroup>
                        {CaptionObject.isCaption(object) && (
                            <PropertyGroup>
                                <PropertyGroupName>字幕</PropertyGroupName>
                                <PropertyRow>
                                    <PropertyName>内容</PropertyName>
                                    <textarea value={object.text} onChange={onCaptionTextChange} />
                                </PropertyRow>
                            </PropertyGroup>
                        )}
                        {VideoObject.isVideo(object) && (
                            <PropertyGroup>
                                <PropertyGroupName>動画</PropertyGroupName>
                                <PropertyRow>
                                    <PropertyName>元ファイル</PropertyName>
                                    <input type="text" value={object.srcFilePath} />
                                </PropertyRow>
                            </PropertyGroup>
                        )}
                    </Body>

                    <Footer>
                        <DeleteButton onClick={onObjectRemove}>削除</DeleteButton>
                    </Footer>
                </>
            )}
            {project !== null && (
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
            )}
        </Base>
    );
}
