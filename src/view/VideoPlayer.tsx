import * as React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Caption } from '../model/Caption';
import { Project } from '../model/Project';
import { VideoController } from '../service/VideoController';
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
    videoController: VideoController;
    project: Project;
}

function renderCaption(ctx: CanvasRenderingContext2D, caption: Caption) {
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

export function VideoPlayer(props: Props): React.ReactElement {
    const { videoController, project } = props;
    const rerenderCanvasContents = useCallbackRef(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const currentVideoTimeInMS = videoController.currentTimeInMS;
        const activeCaption = project.captions.find(
            (caption) => caption.startInMS <= currentVideoTimeInMS && currentVideoTimeInMS < caption.endInMS
        );

        if (activeCaption) {
            renderCaption(ctx, activeCaption);
        }
    });

    useEffect(() => {
        videoController.addEventListener('seek', () => {
            rerenderCanvasContents();
        });
    }, [rerenderCanvasContents, videoController]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        rerenderCanvasContents();
    }, [project.captions, rerenderCanvasContents]);

    const onVideoLoadedMetadata = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = videoController.videoWidth;
        canvas.height = videoController.videoHeight;
        rerenderCanvasContents();
    };

    return (
        <Base>
            <Video
                ref={(e) => videoController.setVideo(e)}
                height={240}
                src={project.inputVideoPath}
                onLoadedMetadata={onVideoLoadedMetadata}
            />
            <Canvas ref={(e) => (canvasRef.current = e)} />
        </Base>
    );
}
