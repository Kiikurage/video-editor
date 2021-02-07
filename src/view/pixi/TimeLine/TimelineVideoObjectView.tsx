import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { VideoObject } from '../../../model/objects/VideoObject';
import { KeyframeLoader } from '../../../service/KeyFrameLoader';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import { attachPixiDragHandlers, detachPixiDragHandlers, PixiDragHandlers, usePixiDragHandlers } from '../../hooks/usePixiDragHandlers';
import { FocusRing } from '../FocusRing';

interface Props {
    video: VideoObject;
    x: number;
    y: number;
    width: number;
    height: number;
    pixelPerSecond: number;
    isSelected: boolean;
    onClick: () => void;
    onChange: (newX: number, newWidth: number) => void;
}

interface InnerProps {
    x: number;
    y: number;
    width: number;
    height: number;
    pixelPerSecond: number;
    keyframeLoader: KeyframeLoader | null;
    onClick: () => void;
    backgroundDragHandlers: PixiDragHandlers;
    wResizerDragHandlers: PixiDragHandlers;
    eResizerDragHandlers: PixiDragHandlers;
}

const TimelineVideoObjectView = CustomPIXIComponent(
    {
        customDisplayObject() {
            const base = new PIXI.Container();

            const background = new PIXI.Graphics();
            background.name = 'background';
            background.interactive = true;
            background.buttonMode = true;
            background.cursor = 'move';
            base.addChild(background);

            const eResizer = new PIXI.Sprite();
            eResizer.name = 'eResizer';
            eResizer.interactive = true;
            eResizer.buttonMode = true;
            eResizer.cursor = 'ew-resize';
            base.addChild(eResizer);

            const wResizer = new PIXI.Sprite();
            wResizer.name = 'wResizer';
            wResizer.interactive = true;
            wResizer.buttonMode = true;
            wResizer.cursor = 'ew-resize';
            base.addChild(wResizer);

            const thumbnailsLayer = new PIXI.Container();
            thumbnailsLayer.name = 'thumbnailsLayer';
            thumbnailsLayer.mask = new PIXI.Graphics();
            base.addChild(thumbnailsLayer);
            base.addChild(thumbnailsLayer.mask);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: InnerProps, newProps: InnerProps): void {
            const {
                x,
                y,
                width,
                height,
                pixelPerSecond,
                keyframeLoader,
                onClick,
                backgroundDragHandlers,
                wResizerDragHandlers,
                eResizerDragHandlers,
            } = newProps;

            base.x = x;
            base.y = y;

            const eResizer = base.getChildByName('eResizer') as PIXI.Graphics;
            eResizer.x = width - 8;
            eResizer.y = 0;
            eResizer.width = 8;
            eResizer.height = height;
            if (oldProps.eResizerDragHandlers) {
                detachPixiDragHandlers(eResizer, oldProps.eResizerDragHandlers);
            }
            if (eResizerDragHandlers) {
                attachPixiDragHandlers(eResizer, eResizerDragHandlers);
            }

            const wResizer = base.getChildByName('wResizer') as PIXI.Graphics;
            wResizer.x = 0;
            wResizer.y = 0;
            wResizer.width = 8;
            wResizer.height = height;
            if (oldProps.wResizerDragHandlers) {
                detachPixiDragHandlers(wResizer, oldProps.wResizerDragHandlers);
            }
            if (wResizerDragHandlers) {
                attachPixiDragHandlers(wResizer, wResizerDragHandlers);
            }
            const thumbnailsLayer = base.getChildByName('thumbnailsLayer') as PIXI.Container;
            (thumbnailsLayer.mask as PIXI.Graphics).clear().beginFill(0xffffff, 1).drawRoundedRect(0, 0, width, height, 4).endFill();

            const thumbnailWidth = (height * 16) / 9;
            const numThumbnails = Math.ceil((width + thumbnailWidth) / thumbnailWidth);
            while (thumbnailsLayer.children.length < numThumbnails) {
                thumbnailsLayer.addChild(new PIXI.Sprite());
            }
            while (thumbnailsLayer.children.length > numThumbnails) {
                thumbnailsLayer.removeChildAt(thumbnailsLayer.children.length - 1);
            }
            for (let i = 0; i < thumbnailsLayer.children.length; i++) {
                const thumbnail = thumbnailsLayer.children[i] as PIXI.Sprite;
                const xStart = thumbnailWidth * i;
                const tStart = (xStart / pixelPerSecond) * 1000;
                const thumbnailImageSource = keyframeLoader?.getKeyframe(tStart);

                if (thumbnailImageSource) {
                    if (thumbnail.texture?.textureCacheIds[0] !== thumbnailImageSource.filePath) {
                        thumbnail.texture = PIXI.Texture.from(thumbnailImageSource.filePath);
                    }
                }

                thumbnail.x = thumbnailWidth * i;
                thumbnail.y = 0;
                thumbnail.width = thumbnailWidth;
                thumbnail.height = height;
            }

            const background = base.getChildByName('background') as PIXI.Graphics;
            background.clear();
            background.beginFill(0x4d90fe, 0.1);
            background.drawRoundedRect(0, 0, width, height, 4);
            background.endFill();
            if (oldProps.backgroundDragHandlers) {
                detachPixiDragHandlers(background, oldProps.backgroundDragHandlers);
            }
            if (backgroundDragHandlers) {
                attachPixiDragHandlers(background, backgroundDragHandlers);
            }
            if (oldProps.onClick) {
                background.off('mousedown', oldProps.onClick);
            }
            if (onClick) {
                background.on('mousedown', onClick);
            }
        },
    },
    'TimelineVideoObjectView'
);

function TimelineVideoObjectViewWrapper(props: Props): React.ReactElement {
    const { video, x, y, width, height, pixelPerSecond, isSelected, onClick, onChange } = props;

    const onKeyframeLoad = useCallbackRef(() => {
        // TODO: Redraw thumbnails
    });
    const keyframeLoader = useRef<KeyframeLoader | null>(null);
    useEffect(() => {
        if (!VideoObject.isVideo(video)) return;

        keyframeLoader.current = new KeyframeLoader(video.srcFilePath);
        keyframeLoader.current.on('load', onKeyframeLoad);
        void keyframeLoader.current.extractKeyframe();

        return () => {
            keyframeLoader.current?.clearAllCache();
            keyframeLoader.current?.off('load', onKeyframeLoad);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onKeyframeLoad, video.srcFilePath]);

    const [{ dx1, dx2 }, setDx] = useState({ dx1: 0, dx2: 0 });
    useEffect(() => {
        setDx({ dx1: 0, dx2: 0 });
    }, [video]);

    const backgroundDragHandlers = usePixiDragHandlers((dx, _dy, type) => {
        if (type === 'end' && dx !== 0) {
            onChange(x + dx, width);
        } else {
            setDx({ dx1: dx, dx2: dx });
        }
    });

    const wResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        ev.stopPropagation();

        if (type === 'end' && dx !== 0) {
            onChange(x + dx, width - dx);
        } else {
            setDx({ dx1: dx, dx2: 0 });
        }
    });

    const eResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        ev.stopPropagation();

        if (type === 'end' && dx !== 0) {
            onChange(x, width + dx);
        } else {
            setDx({ dx1: 0, dx2: dx });
        }
    });

    return (
        <TimelineVideoObjectView
            x={x + dx1}
            y={y}
            width={width + dx2 - dx1}
            height={height}
            pixelPerSecond={pixelPerSecond}
            keyframeLoader={keyframeLoader.current}
            onClick={onClick}
            backgroundDragHandlers={backgroundDragHandlers}
            wResizerDragHandlers={wResizerDragHandlers}
            eResizerDragHandlers={eResizerDragHandlers}
        >
            <FocusRing isSelected={isSelected} width={width + dx2 - dx1} height={height} />
        </TimelineVideoObjectView>
    );
}

export { TimelineVideoObjectViewWrapper as TimelineVideoObjectView };
