import * as React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { assert } from '../lib/util';
import { CaptionObject } from '../model/CaptionObject';
import { Project } from '../model/Project';
import { VideoObject } from '../model/VideoObject';
import { PreviewController } from '../service/PreviewController';
import { useCallbackRef } from './hooks/useCallbackRef';

const Base = styled.div`
    position: relative;
    max-width: 100%;
    max-height: 100%;
`;

const Video = styled.video`
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
`;

const Canvas = styled.canvas`
    position: absolute;
    left: 0;
    height: 100%;
    width: 100%;
    pointer-events: none;
`;

interface Props {
    previewController: PreviewController;
    project: Project;
}

function renderCaption(ctx: CanvasRenderingContext2D, caption: CaptionObject) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.textAlign = 'center';
    ctx.font = 'bold 80px "Noto Sans JP"';
    ctx.fillStyle = '#aa66ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.fillText(caption.text, width / 2, height - 100, width - 200);
    ctx.strokeText(caption.text, width / 2, height - 100, width - 200);
}

export function PreviewPlayer(props: Props): React.ReactElement {
    const { previewController, project } = props;

    const syncVideoPosition = useCallbackRef(() => {
        const video = videoRef.current;
        if (!video) return;

        if (!video.paused) {
            const videoCurrentTimeInMS = video.currentTime * 1000;
            const lag = Math.abs(videoCurrentTimeInMS - previewController.currentTimeInMS);

            if (lag < 100) return;
        }

        video.currentTime = previewController.currentTimeInMS / 1000;
    });

    const rerenderCanvasContents = useCallbackRef(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (canvas.width !== project.viewport.width) {
            canvas.width = project.viewport.width;
        }
        if (canvas.height !== project.viewport.height) {
            canvas.height = project.viewport.height;
        }

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const currentVideoTimeInMS = previewController.currentTimeInMS;
        const activeObjects = project.objects.filter(
            (caption) => caption.startInMS <= currentVideoTimeInMS && currentVideoTimeInMS < caption.endInMS
        );

        for (const object of activeObjects) {
            if (VideoObject.isVideo(object)) {
                continue;
            }

            assert(CaptionObject.isCaption(object), 'Currently, only CaptionObject is supported');
            renderCaption(ctx, object);
        }
    });

    const onPreviewControllerSeek = useCallbackRef(() => {
        syncVideoPosition();
        rerenderCanvasContents();
    });
    const onPreviewControllerPlay = useCallbackRef(() => {
        const video = videoRef.current;
        if (!video) return;

        void video.play();
    });
    const onPreviewControllerPause = useCallbackRef(() => {
        const video = videoRef.current;
        if (!video) return;

        video.pause();
    });

    useEffect(() => {
        previewController.addEventListener('seek', onPreviewControllerSeek);
        previewController.addEventListener('play', onPreviewControllerPlay);
        previewController.addEventListener('pause', onPreviewControllerPause);

        return () => {
            previewController.removeEventListener('seek', onPreviewControllerSeek);
            previewController.removeEventListener('play', onPreviewControllerPlay);
            previewController.removeEventListener('pause', onPreviewControllerPause);
        };
    }, [onPreviewControllerPause, onPreviewControllerPlay, onPreviewControllerSeek, previewController]);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        rerenderCanvasContents();
    }, [project.objects, rerenderCanvasContents]);

    return (
        <Base>
            <Video ref={(e) => (videoRef.current = e)} src={project.inputVideoPath} />
            <Canvas ref={(e) => (canvasRef.current = e)} />
        </Base>
    );
}
