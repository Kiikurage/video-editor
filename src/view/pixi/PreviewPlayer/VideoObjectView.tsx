import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { VideoObject } from '../../../model/VideoObject';
import { PreviewController } from '../../../service/PreviewController';
import { useCallbackRef } from '../../hooks/useCallbackRef';

interface Props {
    video: VideoObject;
    previewController: PreviewController;
}

interface InnerProps {
    texture: PIXI.Texture;
    x: number;
    y: number;
    width: number;
    height: number;
}

const VideoObjectView = CustomPIXIComponent(
    {
        customDisplayObject() {
            const base = new PIXI.Sprite();

            return base;
        },
        customApplyProps(base: PIXI.Sprite, oldProps: InnerProps, newProps: InnerProps): void {
            const { texture, x, y, width, height } = newProps;

            base.texture = texture;
            base.x = x;
            base.y = y;
            base.width = width;
            base.height = height;
        },
    },
    'VideoObjectView'
);

function VideoObjectViewWrapper(props: Props): React.ReactElement {
    const { video, previewController } = props;

    const textureRef = useRef<PIXI.Texture>(PIXI.Texture.EMPTY);

    const onPreviewControllerSeek = useCallbackRef(() => {
        const currentPreviewTimeInMS = previewController.currentTimeInMS;

        const videoResource = textureRef.current.baseTexture.resource as PIXI.resources.VideoResource;
        const videoElement = videoResource.source as HTMLVideoElement;

        const expectedVideoCurrentTimeInMS = currentPreviewTimeInMS - video.startInMS;
        const videoCurrentTimeInMS = videoElement.currentTime * 1000;

        if (videoElement.paused) {
            if (!previewController.paused) {
                void videoElement.play().catch(() => void 0);
            } else {
                videoElement.currentTime = expectedVideoCurrentTimeInMS / 1000;
                textureRef.current.update();
            }
        } else {
            const lagInMS = currentPreviewTimeInMS - (videoCurrentTimeInMS + video.startInMS);
            if (Math.abs(lagInMS) > 200) {
                videoElement.currentTime = expectedVideoCurrentTimeInMS / 1000;
            }
        }
    });

    const onPreviewControllerPause = useCallbackRef(() => {
        const videoResource = textureRef.current.baseTexture.resource as PIXI.resources.VideoResource;
        const videoElement = videoResource.source as HTMLVideoElement;

        videoElement.pause();
    });

    useEffect(() => {
        previewController.on('pause', onPreviewControllerPause);
        previewController.on('seek', onPreviewControllerSeek);

        return () => {
            previewController.off('pause', onPreviewControllerPause);
            previewController.off('seek', onPreviewControllerSeek);
        };
    }, [onPreviewControllerPause, onPreviewControllerSeek, previewController]);

    useEffect(() => {
        return () => {
            const videoResource = textureRef.current.baseTexture.resource as PIXI.resources.VideoResource;
            const videoElement = videoResource.source as HTMLVideoElement;

            videoElement.pause();
        };
    }, []);

    useEffect(() => {
        textureRef.current = new PIXI.Texture(
            new PIXI.BaseTexture(
                new PIXI.resources.VideoResource(video.srcFilePath, {
                    autoLoad: true,
                    autoPlay: false,
                })
            )
        );
    }, [video.srcFilePath]);

    return <VideoObjectView texture={textureRef.current} x={video.x} y={video.y} width={video.width} height={video.height} />;
}

export { VideoObjectViewWrapper as VideoObjectView };
