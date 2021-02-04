import * as Mousetrap from 'mousetrap';
import * as path from 'path';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { showOpenFileDialog } from '../ipc/renderer/showOpenFileDialog';
import { showSaveFileDialog } from '../ipc/renderer/showSaveFileDialog';
import { assert } from '../lib/util';
import { UUID } from '../lib/UUID';
import { BaseObject } from '../model/objects/BaseObject';
import { CaptionObject } from '../model/objects/CaptionObject';
import { ImageObject } from '../model/objects/ImageObject';
import { VideoObject } from '../model/objects/VideoObject';
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
    const [project, setProject] = useState<Project>(() => ({
        fps: 30,
        viewport: {
            width: 1920,
            height: 1080,
        },
        objects: [
            {
                id: UUID(),
                type: VideoObject.type,
                startInMS: 0,
                endInMS: 4 * 60 * 1000,
                srcFilePath: path.resolve(__dirname, '../src/static/video.mp4'),
                x: 0,
                y: 0,
                width: 1920,
                height: 1080,
            } as VideoObject,
            {
                id: UUID(),
                type: ImageObject.type,
                startInMS: 3000,
                endInMS: 20000,
                x: 100,
                y: 100,
                width: 400,
                height: 400,
                srcFilePath: path.resolve(__dirname, '../src/static/image.png'),
            } as ImageObject,
            {
                id: UUID(),
                type: CaptionObject.type,
                startInMS: 5000,
                endInMS: 8000,
                text: '最初の字幕',
                x: 960,
                y: 1040,
                width: 1920,
                height: 1080,
            } as CaptionObject,
            {
                id: UUID(),
                type: CaptionObject.type,
                startInMS: 10000,
                endInMS: 15000,
                text: '2番目の字幕',
                x: 0,
                y: 0,
                width: 1920,
                height: 1080,
            } as CaptionObject,
        ],
    }));
    const [selectedObject, setSelectedObject] = useState<BaseObject | null>(null);

    const videoController = usePreviewController();

    useEffect(() => {
        Mousetrap.bind('command+o', onOpenProject);
        Mousetrap.bind('command+s', onSaveProject);
        Mousetrap.bind('command+shift+s', onSaveAsNewProject);
        Mousetrap.bind('space', onTogglePreviewPlay);
        Mousetrap.bind('backspace', onRemoveSelectedObject);
        Mousetrap.bind('del', onRemoveSelectedObject);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onTogglePreviewPlay = useCallbackRef(() => {
        if (videoController.paused) {
            videoController.play();
        } else {
            videoController.pause();
        }
    });

    const onChangeProject = useCallbackRef((oldValue: Project, newValue: Project) => {
        setProject(newValue);
    });

    const onSelectObject = useCallbackRef((object: BaseObject | null) => {
        setSelectedObject(object);
    });

    const onAddObject = useCallbackRef((object: BaseObject) => {
        setProject((prevState) => {
            return {
                ...prevState,
                objects: [...project.objects, object],
            };
        });
    });

    const onChangeObject = useCallbackRef((oldValue: BaseObject, newValue: BaseObject) => {
        if (oldValue === selectedObject) {
            setSelectedObject(newValue);
        }

        setProject((prevState) => {
            const i = prevState.objects.indexOf(oldValue);
            if (i === -1) return prevState;

            const newObjects = prevState.objects.slice(0);
            newObjects.splice(i, 1, newValue);

            return { ...prevState, objects: newObjects };
        });
    });

    const onRemoveObject = useCallbackRef((object: BaseObject) => {
        if (object === selectedObject) {
            setSelectedObject(null);
        }

        setProject((prevState) => {
            const i = prevState.objects.indexOf(object);
            if (i === -1) return prevState;

            const newCaptionList = prevState.objects.slice(0);
            newCaptionList.splice(i, 1);

            return { ...prevState, objects: newCaptionList };
        });
    });

    const onRemoveSelectedObject = useCallbackRef(() => {
        if (selectedObject === null) return;
        onRemoveObject(selectedObject);
    });

    const onExportVideo = useCallbackRef(async () => {
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
    });

    const onOpenProject = useCallbackRef(async () => {
        const { canceled, filePaths } = await showOpenFileDialog();
        if (canceled) return;

        const newProject = await Project.open(filePaths[0]);
        setProject(newProject);
    });

    const onSaveProject = useCallbackRef(() => {
        // TODO
        void onSaveAsNewProject();
    });

    const onSaveAsNewProject = useCallbackRef(async () => {
        const { canceled, filePath } = await showSaveFileDialog();
        if (canceled) return;

        assert(filePath !== undefined, 'WTF?');

        await Project.save(filePath, project);
    });

    return (
        <AppShell
            project={project}
            selectedObject={selectedObject}
            previewController={videoController}
            onChangeProject={onChangeProject}
            onSelectObject={onSelectObject}
            onAddObject={onAddObject}
            onChangeObject={onChangeObject}
            onRemoveObject={onRemoveObject}
            onExportVideo={onExportVideo}
            onOpenProject={onOpenProject}
            onSaveProject={onSaveProject}
        />
    );
}
