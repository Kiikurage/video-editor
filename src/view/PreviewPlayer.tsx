import * as React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { assert } from '../lib/util';
import { CaptionObject } from '../model/CaptionObject';
import { ImageObject } from '../model/ImageObject';
import { Project } from '../model/Project';
import { VideoObject } from '../model/VideoObject';
import { PreviewController } from '../service/PreviewController';
import { useCallbackRef } from './hooks/useCallbackRef';

const MAX_ACCEPTABLE_VIDEO_LAG_IN_MS = 50;
const SEEK_DELAY_IN_MS = 1000;

const Base = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    background: #e0e0e0;
    padding: 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    overflow-x: auto;
    overflow-y: auto;
`;

const ContentBase = styled.div`
    position: relative;
    background: #fff;
    box-shadow: rgba(50, 50, 93, 0.25) 0 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
`;

const Video = styled.video`
    position: absolute;
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

function renderImage(ctx: CanvasRenderingContext2D, image: ImageObject) {
    if (image._imageDataCache === undefined) {
        image._imageDataCache = 'loading';
        const imageElement = new Image();

        void (async () => {
            await new Promise((r) => {
                imageElement.onload = r;
                imageElement.src = image.srcFilePath;
            });

            image._imageDataCache = imageElement;
            // TODO: 非同期に読み込んでいるので初回読み込み時は画像が表示されない
        })();

        return;
    }

    if (image._imageDataCache === 'loading') {
        return;
    }

    ctx.drawImage(image._imageDataCache, image.x, image.y, image.width, image.height);
}

export function PreviewPlayer(props: Props): React.ReactElement {
    const { previewController, project } = props;

    const syncVideoPosition = useCallbackRef(() => {
        const currentPreviewTimeInMS = previewController.currentTimeInMS;

        const videos = project.objects.filter((object) => VideoObject.isVideo(object)) as VideoObject[];
        for (const video of videos) {
            const videoElement = videoRef.current.get(video.id);
            if (videoElement === undefined || videoElement === null) {
                continue;
            }

            const isActive = video.startInMS <= currentPreviewTimeInMS && currentPreviewTimeInMS < video.endInMS;

            if (isActive) {
                videoElement.style.display = 'block';
                const expectedVideoCurrentTimeInMS = currentPreviewTimeInMS - video.startInMS;
                const videoCurrentTimeInMS = videoElement.currentTime * 1000;
                if (videoElement.paused) {
                    if (!previewController.paused) {
                        void videoElement.play().catch(() => void 0);
                    } else {
                        videoElement.currentTime = expectedVideoCurrentTimeInMS / 1000;
                    }
                } else {
                    const lagInMS = currentPreviewTimeInMS - (videoCurrentTimeInMS + video.startInMS);
                    if (lagInMS > MAX_ACCEPTABLE_VIDEO_LAG_IN_MS || lagInMS < -MAX_ACCEPTABLE_VIDEO_LAG_IN_MS - SEEK_DELAY_IN_MS) {
                        videoElement.currentTime = (expectedVideoCurrentTimeInMS + SEEK_DELAY_IN_MS) / 1000;
                    } else if (lagInMS < -MAX_ACCEPTABLE_VIDEO_LAG_IN_MS) {
                        videoElement.pause();
                    }
                }
            } else {
                videoElement.style.display = 'none';
                videoElement.pause();
                videoElement.currentTime = 0;
            }
        }
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

            if (ImageObject.isImage(object)) {
                renderImage(ctx, object);
            } else if (CaptionObject.isCaption(object)) {
                renderCaption(ctx, object);
            } else {
                assert(false, `Unsupported object type: ${object.type}`);
            }
        }
    });

    const onPreviewControllerSeek = useCallbackRef(() => {
        syncVideoPosition();
        rerenderCanvasContents();
    });
    const onPreviewControllerPause = useCallbackRef(() => {
        const currentPreviewTimeInMS = previewController.currentTimeInMS;
        const videos = project.objects.filter((object) => VideoObject.isVideo(object)) as VideoObject[];
        for (const video of videos) {
            const videoElement = videoRef.current.get(video.id);
            if (videoElement === undefined || videoElement === null) {
                continue;
            }

            const isActive = video.startInMS <= currentPreviewTimeInMS && currentPreviewTimeInMS < video.endInMS;
            if (isActive) {
                videoElement.pause();
            }
        }
    });

    useEffect(() => {
        previewController.on('seek', onPreviewControllerSeek);
        previewController.on('pause', onPreviewControllerPause);

        return () => {
            previewController.off('seek', onPreviewControllerSeek);
            previewController.off('pause', onPreviewControllerPause);
        };
    }, [onPreviewControllerPause, onPreviewControllerSeek, previewController]);

    const videoRef = useRef<Map<string, HTMLVideoElement | null>>(new Map());
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        rerenderCanvasContents();
    }, [project.objects, rerenderCanvasContents]);

    const contentBaseWidth = 640;
    const contentBaseHeight = 360;

    return (
        <Base>
            <ContentBase style={{ width: contentBaseWidth, height: contentBaseHeight }}>
                {(project.objects.filter((object) => VideoObject.isVideo(object)) as VideoObject[]).map((video) => (
                    <Video key={video.id} src={video.srcFilePath} ref={(e) => videoRef.current.set(video.id, e)} preload="auto" />
                ))}
                <Canvas ref={(e) => (canvasRef.current = e)} />
            </ContentBase>
        </Base>
    );
}
