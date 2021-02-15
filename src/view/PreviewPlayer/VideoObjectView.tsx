import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { VideoObject } from '../../model/objects/VideoObject';
import { PreviewController } from '../../service/PreviewController';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { ResizeView } from './ResizeView/ResizeView';

interface Props {
    video: VideoObject;
    previewController: PreviewController;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onSelect: (ev: PIXI.InteractionEvent) => void;
    onObjectChange: (oldObject: VideoObject, x: number, y: number, width: number, height: number) => void;
}

interface PixiProps {
    texture: PIXI.Texture;
    object: VideoObject;
    timeInMS: number;
}

function applyProps(base: PIXI.Sprite, props: PixiProps) {
    const { texture, object, timeInMS } = props;
    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, timeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, timeInMS);
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);

    base.texture = texture;
    base.x = x;
    base.y = y;
    base.width = width;
    base.height = height;
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

function VideoObjectViewWrapper(props: Props): React.ReactElement {
    const { video, previewController, selected, snapPositionXs, snapPositionYs, onObjectChange, onSelect } = props;
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

    const onPreviewControllerPlay = useCallbackRef(() => {
        const currentPreviewTimeInMS = previewController.currentTimeInMS;

        const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource;
        const videoElement = videoResource.source as HTMLVideoElement;

        const expectedVideoCurrentTimeInMS = currentPreviewTimeInMS - video.startInMS;

        if (0 <= expectedVideoCurrentTimeInMS && expectedVideoCurrentTimeInMS <= video.endInMS) {
            videoElement.currentTime = expectedVideoCurrentTimeInMS / 1000;
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
                new PIXI.resources.VideoResource(video.srcFilePath, {
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
    }, [onPreviewControllerSeek, video.srcFilePath]);

    const onChange = useCallbackRef((x: number, y: number, width: number, height: number) => {
        onObjectChange(video, x, y, width, height);
    });

    return (
        <ResizeView
            object={video}
            previewController={previewController}
            snapPositionXs={snapPositionXs}
            snapPositionYs={snapPositionYs}
            onChange={onChange}
            onSelect={onSelect}
            selected={selected}
        >
            <VideoObjectView texture={texture} object={video} timeInMS={previewController.currentTimeInMS} />
        </ResizeView>
    );
}

export { VideoObjectViewWrapper as VideoObjectView };
