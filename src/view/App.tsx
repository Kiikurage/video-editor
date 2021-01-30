import * as path from 'path';
import * as React from 'react';
import { useRef, useState } from 'react';
import { assert } from '../lib/util';
import { BaseObject } from '../model/BaseObject';
import { Project } from '../model/Project';
import { OutputBuilder } from '../service/OutputBuilder';
import { VideoController } from '../service/VideoController';
import { AppShell } from './AppShell';

function useVideoController(): VideoController {
    const ref = useRef<VideoController | null>(null);
    let controller = ref.current;
    if (controller === null) {
        ref.current = controller = new VideoController();
    }
    return controller;
}

export function App(): React.ReactElement {
    const videoController = useVideoController();

    const [project, setProject] = useState<Project>(() => ({
        inputVideoPath: path.resolve(__dirname, '../src/static/video.mp4'),
        // inputVideoPath: undefined,
        objects: [
            {
                type: 'CAPTION',
                startInMS: 5000,
                endInMS: 8000,
                text: '最初の字幕',
            },
            {
                type: 'CAPTION',
                startInMS: 10000,
                endInMS: 15000,
                text: '2番目の字幕',
            },
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
        assert(project.inputVideoPath !== undefined, 'Input video is not loaded');

        const outputBuilder = new OutputBuilder()
            .setInputVideoPath(project.inputVideoPath)
            .setProject(project)
            .setOutputVideoPath('./output.mp4');

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
            videoController={videoController}
        />
    );
}
