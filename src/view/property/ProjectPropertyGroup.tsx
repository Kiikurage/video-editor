import * as React from 'react';
import { Project } from '../../model/Project';
import { AppController } from '../../service/AppController';
import { ColorInput } from '../ColorInput';
import { FormControl } from '../FormControl';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { NumberInput } from '../NumberInput';
import { PropertyGroup, PropertyGroupName, PropertyRow } from './PropertyGroup';

export function ProjectPropertyGroup(props: { appController: AppController; project: Project }): React.ReactElement {
    const { appController, project } = props;

    const onProjectFPSChange = useCallbackRef((value: number) => {
        appController.setProject({ ...project, fps: value, isSaved: false });
    });
    const onProjectViewportWidthChange = useCallbackRef((value: number) => {
        appController.setProject({ ...project, viewport: { ...project.viewport, width: value }, isSaved: false });
    });
    const onProjectViewportHeightChange = useCallbackRef((value: number) => {
        appController.setProject({ ...project, viewport: { ...project.viewport, height: value }, isSaved: false });
    });
    const onProjectViewportBackgroundColorChange = useCallbackRef((value: number) => {
        appController.setProject({ ...project, viewport: { ...project.viewport, backgroundColor: value }, isSaved: false });
    });

    return (
        <PropertyGroup>
            <PropertyGroupName>プロジェクト設定</PropertyGroupName>
            <PropertyRow>
                <FormControl label="FPS">
                    <NumberInput min={1} max={60} value={project.fps} onChange={onProjectFPSChange} />
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl label="幅">
                    <NumberInput min={0} max={1960} value={project.viewport.width} onChange={onProjectViewportWidthChange} />
                </FormControl>
                <FormControl label="高さ">
                    <NumberInput min={0} max={1080} value={project.viewport.height} onChange={onProjectViewportHeightChange} />
                </FormControl>
            </PropertyRow>
            <PropertyRow>
                <FormControl label="背景の色">
                    <ColorInput value={project.viewport.backgroundColor} onChange={onProjectViewportBackgroundColorChange} />
                </FormControl>
            </PropertyRow>
        </PropertyGroup>
    );
}
