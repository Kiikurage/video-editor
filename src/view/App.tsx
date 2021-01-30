import * as path from 'path';
import * as React from 'react';
import { useRef, useState } from 'react';
import { assert } from '../lib/util';
import { Caption } from '../model/Caption';
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
        captions: [
            {
                startInMS: 5000,
                endInMS: 8000,
                text: '最初の字幕',
            },
            {
                startInMS: 10000,
                endInMS: 15000,
                text: '2番目の字幕',
            },
        ],
    }));
    const [focusedNode, setFocusedNode] = useState<Caption | null>(null);

    const onCaptionFocus = (caption: Caption) => {
        setFocusedNode(caption);
    };

    const setCaptionList = (newCaptionList: Caption[]) => {
        setProject((prevState) => {
            return {
                ...prevState,
                captions: newCaptionList,
            };
        });
    };
    const onCaptionChange = (oldValue: Caption, newValue: Caption) => {
        const i = project.captions.indexOf(oldValue);
        if (i === -1) return;

        const newCaptionList = project.captions.slice(0);
        newCaptionList.splice(i, 1, newValue);

        setCaptionList(newCaptionList);
    };

    const onAddCaptionButtonClick = () => {
        setCaptionList([
            ...project.captions,
            {
                text: '字幕',
                startInMS: videoController.currentTimeInMS,
                endInMS: videoController.currentTimeInMS + 5000,
            },
        ]);
    };

    const onCaptionRemoveButtonClick = (caption: Caption) => {
        const i = project.captions.indexOf(caption);
        if (i === -1) return;

        const newCaptionList = project.captions.slice(0);
        newCaptionList.splice(i, 1);

        setCaptionList(newCaptionList);
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
            .setCaptionList(project.captions)
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
            focusedNode={focusedNode}
            onCaptionChange={onCaptionChange}
            onCaptionFocus={onCaptionFocus}
            onAddCaptionButtonClick={onAddCaptionButtonClick}
            onCaptionRemoveButtonClick={onCaptionRemoveButtonClick}
            onVideoOpen={onVideoOpenButtonClick}
            onVideoExportButtonClick={onVideoExportButtonClick}
            videoController={videoController}
        />
    );
}
