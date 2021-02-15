import * as React from 'react';
import styled from 'styled-components';
import { Project } from '../../model/Project';
import { AppController } from '../../service/AppController';
import { useCallbackRef } from '../hooks/useCallbackRef';

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

export function ProjectPropertyGroup(props: { appController: AppController; project: Project }): React.ReactElement {
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
