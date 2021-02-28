import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { VideoFrame } from '../../model/frame/VideoFrame';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';

interface PixiProps {
    texture: PIXI.Texture;
    frame: VideoFrame;
}

function applyProps(base: PIXI.Sprite, props: PixiProps) {
    const { texture, frame } = props;
    base.texture = texture;
    base.x = frame.x;
    base.y = frame.y;
    base.width = frame.width;
    base.height = frame.height;
}

const VideoObjectView = CustomPIXIComponent(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Sprite();

            applyProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Sprite, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);
        },
    },
    'VideoObjectView'
);

function VideoObjectViewWrapper(props: PreviewPlayerObjectViewProps<VideoFrame>): React.ReactElement {
    const { frame, previewController } = props;
    const [texture, setTexture] = useState(PIXI.Texture.EMPTY);

    const onPreviewControllerSeek = useCallbackRef(() => {
        const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource;
        const videoElement = videoResource.source as HTMLVideoElement;

        const videoCurrentTimeInMS = videoElement.currentTime * 1000;

        if (videoElement.paused) {
            if (!previewController.paused) {
                void videoElement.play().catch(() => void 0);
            } else {
                videoElement.currentTime = frame.timeInMS / 1000;
                texture.update();
            }
        } else {
            const lagInMS = frame.timeInMS - videoCurrentTimeInMS;
            if (Math.abs(lagInMS) > 200) {
                videoElement.currentTime = (frame.timeInMS + lagInMS) / 1000;
            }
        }
    });

    const onPreviewControllerPlay = useCallbackRef(() => {
        const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource;
        const videoElement = videoResource.source as HTMLVideoElement;

        if (0 <= frame.timeInMS && frame.timeInMS <= frame.duration) {
            videoElement.currentTime = frame.timeInMS / 1000;
            void videoElement.play().catch(() => void 0);
        }
    });

    const onPreviewControllerPause = useCallbackRef(() => {
        const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource;
        const videoElement = videoResource.source as HTMLVideoElement;

        videoElement.pause();
    });

    useEffect(() => {
        previewController.on('play', onPreviewControllerPlay);
        previewController.on('pause', onPreviewControllerPause);
        previewController.on('seek', onPreviewControllerSeek);

        return () => {
            previewController.off('play', onPreviewControllerPlay);
            previewController.off('pause', onPreviewControllerPause);
            previewController.off('seek', onPreviewControllerSeek);
        };
    }, [onPreviewControllerPause, onPreviewControllerPlay, onPreviewControllerSeek, previewController]);

    useEffect(() => {
        return () => {
            const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource | null;
            if (!videoResource) return;
            const videoElement = videoResource.source as HTMLVideoElement;

            videoElement.pause();
        };
    }, [texture.baseTexture.resource]);

    useEffect(() => {
        const newTexture = new PIXI.Texture(
            new PIXI.BaseTexture(
                new PIXI.resources.VideoResource(frame.srcFilePath, {
                    autoLoad: true,
                    autoPlay: false,
                })
            )
        );

        newTexture.baseTexture.once('loaded', () => {
            ((newTexture.baseTexture.resource as PIXI.resources.VideoResource).source as HTMLVideoElement).muted = true;
            setTexture(newTexture);
            onPreviewControllerSeek();
        });
    }, [onPreviewControllerSeek, frame.srcFilePath]);

    return <VideoObjectView texture={texture} frame={frame} />;
}

export { VideoObjectViewWrapper as VideoObjectView };
