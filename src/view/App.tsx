import * as path from 'path';
import * as React from 'react';
import { useRef, useState } from 'react';
import { UUID } from '../lib/UUID';
import { BaseObject } from '../model/BaseObject';
import { CaptionObject } from '../model/CaptionObject';
import { ImageObject } from '../model/ImageObject';
import { Project } from '../model/Project';
import { VideoObject } from '../model/VideoObject';
import { OutputBuilder } from '../service/OutputBuilder';
import { PreviewController } from '../service/PreviewController';
import { AppShell } from './AppShell';

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
        inputVideoPath: path.resolve(__dirname, '../src/static/video.mp4'),
        // inputVideoPath: undefined,
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
            } as CaptionObject,
            {
                id: UUID(),
                type: CaptionObject.type,
                startInMS: 10000,
                endInMS: 15000,
                text: '2番目の字幕',
            } as CaptionObject,
        ],
    }));
    const [selectedObject, setSelectedObject] = useState<BaseObject | null>(null);

    const onObjectSelect = (object: BaseObject) => {
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
        const i = project.objects.indexOf(oldValue);
        if (i === -1) return;

        const newObjects = project.objects.slice(0);
        newObjects.splice(i, 1, newValue);

        setObjects(newObjects);
    };

    const onObjectRemove = (object: BaseObject) => {
        const i = project.objects.indexOf(object);
        if (i === -1) return;

        const newCaptionList = project.objects.slice(0);
        newCaptionList.splice(i, 1);

        setObjects(newCaptionList);
    };

    const onVideoOpenButtonClick = (inputVideoPath: string) => {
        setProject((prevState) => ({
            ...prevState,
            inputVideoPath: inputVideoPath,
        }));
    };

    const onVideoExportButtonClick = async () => {
        const outputBuilder = new OutputBuilder().setProject(project).setOutputVideoPath('./output.mp4');

        outputBuilder.addEventListener('log', () => {
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

    return (
        <AppShell
            project={project}
            selectedObject={selectedObject}
            onObjectSelect={onObjectSelect}
            onObjectAdd={onObjectAdd}
            onObjectChange={onObjectChange}
            onObjectRemove={onObjectRemove}
            onVideoOpen={onVideoOpenButtonClick}
            onVideoExportButtonClick={onVideoExportButtonClick}
            previewController={videoController}
        />
    );
}
