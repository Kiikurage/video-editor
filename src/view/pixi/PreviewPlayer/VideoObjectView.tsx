import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { VideoObject } from '../../../model/objects/VideoObject';
import { PreviewController } from '../../../service/PreviewController';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import { ResizeView } from './ResizeView';

interface Props {
    video: VideoObject;
    previewController: PreviewController;
    selected: boolean;
    onSelect: () => void;
    onObjectChange: (oldObject: VideoObject, newObject: VideoObject) => void;
}

interface InnerProps {
    texture: PIXI.Texture;
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
            const { texture, width, height } = newProps;

            base.texture = texture;
            base.x = 0;
            base.y = 0;
            base.width = width;
            base.height = height;
        },
    },
    'VideoObjectView'
);

function VideoObjectViewWrapper(props: Props): React.ReactElement {
    const { video, previewController, selected, onObjectChange, onSelect } = props;
    const [texture, setTexture] = useState(PIXI.Texture.EMPTY);

    const onPreviewControllerSeek = useCallbackRef(() => {
        const currentPreviewTimeInMS = previewController.currentTimeInMS;

        const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource;
        const videoElement = videoResource.source as HTMLVideoElement;

        const expectedVideoCurrentTimeInMS = currentPreviewTimeInMS - video.startInMS;
        const videoCurrentTimeInMS = videoElement.currentTime * 1000;

        if (videoElement.paused) {
            if (!previewController.paused) {
                void videoElement.play().catch(() => void 0);
            } else {
                videoElement.currentTime = expectedVideoCurrentTimeInMS / 1000;
                texture.update();
            }
        } else {
            const lagInMS = currentPreviewTimeInMS - (videoCurrentTimeInMS + video.startInMS);
            if (Math.abs(lagInMS) > 200) {
                videoElement.currentTime = (expectedVideoCurrentTimeInMS + lagInMS) / 1000;
            }
        }
    });

    const onPreviewControllerPause = useCallbackRef(() => {
        const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource;
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
            const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource | null;
            if (!videoResource) return;
            const videoElement = videoResource.source as HTMLVideoElement;

            videoElement.pause();
        };
    }, [texture.baseTexture.resource]);

    useEffect(() => {
        const newTexture = new PIXI.Texture(
            new PIXI.BaseTexture(
                new PIXI.resources.VideoResource(video.srcFilePath, {
                    autoLoad: true,
                    autoPlay: false,
                })
            )
        );

        newTexture.baseTexture.once('loaded', () => {
            setTexture(newTexture);
            onPreviewControllerSeek();
        });
    }, [onPreviewControllerSeek, video.srcFilePath]);

    return (
        <ResizeView object={video} onObjectChange={onObjectChange} onSelect={onSelect} selected={selected}>
            <VideoObjectView texture={texture} width={video.width} height={video.height} />
        </ResizeView>
    );
}

export { VideoObjectViewWrapper as VideoObjectView };
