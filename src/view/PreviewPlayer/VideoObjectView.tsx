import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { VideoObject } from '../../model/objects/VideoObject';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { PreviewCanvasViewportInfo, usePreviewCanvasViewportInfo } from './PreviewPlayer';
import { PreviewPlayerObjectViewProps } from './PreviewPlayerObjectView';
import { ResizeView } from './ResizeView/ResizeView';

interface PixiProps {
    texture: PIXI.Texture;
    object: VideoObject;
    canvasContext: PreviewCanvasViewportInfo;
    timeInMS: number;
}

function applyProps(base: PIXI.Sprite, props: PixiProps) {
    const { texture, object, canvasContext, timeInMS } = props;
    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, timeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, timeInMS);
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);

    base.texture = texture;
    base.x = (x - canvasContext.left) * canvasContext.scale;
    base.y = (y - canvasContext.top) * canvasContext.scale;
    base.width = width * canvasContext.scale;
    base.height = height * canvasContext.scale;
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

function VideoObjectViewWrapper(props: PreviewPlayerObjectViewProps<VideoObject>): React.ReactElement {
    const { object, previewController, onChange, onSelect, selected } = props;
    const canvasContext = usePreviewCanvasViewportInfo();
    const [texture, setTexture] = useState(PIXI.Texture.EMPTY);

    const onPreviewControllerSeek = useCallbackRef(() => {
        const currentPreviewTimeInMS = previewController.currentTimeInMS;

        const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource;
        const videoElement = videoResource.source as HTMLVideoElement;

        const expectedVideoCurrentTimeInMS = currentPreviewTimeInMS - object.startInMS;
        const videoCurrentTimeInMS = videoElement.currentTime * 1000;

        if (videoElement.paused) {
            if (!previewController.paused) {
                void videoElement.play().catch(() => void 0);
            } else {
                videoElement.currentTime = expectedVideoCurrentTimeInMS / 1000;
                texture.update();
            }
        } else {
            const lagInMS = currentPreviewTimeInMS - (videoCurrentTimeInMS + object.startInMS);
            if (Math.abs(lagInMS) > 200) {
                videoElement.currentTime = (expectedVideoCurrentTimeInMS + lagInMS) / 1000;
            }
        }
    });

    const onPreviewControllerPlay = useCallbackRef(() => {
        const currentPreviewTimeInMS = previewController.currentTimeInMS;

        const videoResource = texture.baseTexture.resource as PIXI.resources.VideoResource;
        const videoElement = videoResource.source as HTMLVideoElement;

        const expectedVideoCurrentTimeInMS = currentPreviewTimeInMS - object.startInMS;

        if (0 <= expectedVideoCurrentTimeInMS && expectedVideoCurrentTimeInMS <= object.endInMS) {
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
                new PIXI.resources.VideoResource(object.srcFilePath, {
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
    }, [onPreviewControllerSeek, object.srcFilePath]);

    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, previewController.currentTimeInMS);

    return (
        <>
            <VideoObjectView texture={texture} object={object} canvasContext={canvasContext} timeInMS={previewController.currentTimeInMS} />
            <ResizeView
                x={x}
                y={y}
                width={width}
                height={height}
                selected={selected}
                locked={object.locked}
                onChange={onChange}
                onSelect={onSelect}
            />
        </>
    );
}

export { VideoObjectViewWrapper as VideoObjectView };
