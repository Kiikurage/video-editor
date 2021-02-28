import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { KeyframeLoader } from '../../service/KeyFrameLoader';

interface PixiProps {
    forceRerenderCounter: number;
    width: number;
    height: number;
    pixelPerMS: number;
    keyframeLoader: KeyframeLoader | null;
}

function applyProps(base: PIXI.Container, props: PixiProps) {
    const { width, height, pixelPerMS, keyframeLoader } = props;

    const thumbnailWidth = (height * 16) / 9;
    const numThumbnails = Math.ceil((width + thumbnailWidth) / thumbnailWidth);
    while (base.children.length < numThumbnails) {
        base.addChild(new PIXI.Sprite());
    }
    if (base.children.length > numThumbnails) {
        base.removeChildren(numThumbnails);
    }

    for (let i = 0; i < base.children.length; i++) {
        const thumbnail = base.children[i] as PIXI.Sprite;
        const xStart = thumbnailWidth * i;
        const tStart = xStart / pixelPerMS;
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
}

export const ThumbnailList = CustomPIXIComponent<PIXI.Container, PixiProps>(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Container();

            applyProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);
        },
    },
    'ThumbnailList'
);
