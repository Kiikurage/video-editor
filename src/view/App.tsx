import * as React from 'react';
import { useRef, useState } from 'react';
import { BaseObject } from '../model/objects/BaseObject';
import { Project } from '../model/Project';
import { OutputBuilder } from '../service/OutputBuilder';
import { PreviewController } from '../service/PreviewController';
import { AppShell } from './AppShell';
import { useCallbackRef } from './hooks/useCallbackRef';

function usePreviewController(): PreviewController {
    const ref = useRef<PreviewController | null>(null);
    let controller = ref.current;
    if (controller === null) {
        ref.current = controller = new PreviewController();
    }
    return controller;
}

export function App(): React.ReactElement {
    const videoController = usePreviewController();

    const [project, setProject] = useState<Project>(() => ({
        viewport: {
            width: 1920,
            height: 1080,
        },
        objects: [],
    }));
    const [selectedObject, setSelectedObject] = useState<BaseObject | null>(null);

    const onObjectSelect = (object: BaseObject | null) => {
        setSelectedObject(object);
    };

    const setObjects = (newObjects: BaseObject[]) => {
        setProject((prevState) => {
            return {
                ...prevState,
                objects: newObjects,
            };
        });
    };

    const onObjectAdd = (object: BaseObject) => {
        setObjects([...project.objects, object]);
    };

    const onObjectChange = (oldValue: BaseObject, newValue: BaseObject) => {
        if (oldValue === selectedObject) {
            setSelectedObject(newValue);
        }

        const i = project.objects.indexOf(oldValue);
        if (i === -1) return;

        const newObjects = project.objects.slice(0);
        newObjects.splice(i, 1, newValue);

        setObjects(newObjects);
    };

    const onObjectRemove = (object: BaseObject) => {
        if (object === selectedObject) {
            setSelectedObject(null);
        }

        const i = project.objects.indexOf(object);
        if (i === -1) return;

        const newCaptionList = project.objects.slice(0);
        newCaptionList.splice(i, 1);

        setObjects(newCaptionList);
    };

    const onVideoExportButtonClick = async () => {
        const outputBuilder = new OutputBuilder().setProject(project).setOutputVideoPath('./output.mp4');

        outputBuilder.on('log', () => {
            console.log(outputBuilder.log);
        });

        try {
            await outputBuilder.build();
        } catch (err) {
            console.error('Failed to export video', err);
            // TODO: クリーンアップされず永遠にゴミが残る
            return;
        }
        //
        // cleanUpWorkspace();
    };

    const onProjectOpen = useCallbackRef(async (path: string) => {
        const newProject = await Project.open(path);
        setProject(newProject);
    });

    const onProjectSave = useCallbackRef(async (path: string) => {
        await Project.save(path, project);
    });

    return (
        <AppShell
            project={project}
            selectedObject={selectedObject}
            onObjectSelect={onObjectSelect}
            onObjectAdd={onObjectAdd}
            onObjectChange={onObjectChange}
            onObjectRemove={onObjectRemove}
            onVideoExportButtonClick={onVideoExportButtonClick}
            onProjectOpen={onProjectOpen}
            onProjectSave={onProjectSave}
            previewController={videoController}
        />
    );
}
