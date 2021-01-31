import * as PIXI from 'pixi.js';
import { useEffect, useRef } from 'react';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { ImageObject } from '../../../model/ImageObject';

interface Props {
    image: ImageObject;
}

interface InnerProps {
    texture: PIXI.Texture;
    x: number;
    y: number;
    width: number;
    height: number;
}

const ImageObjectView = CustomPIXIComponent(
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
    'ImageObjectView'
);

function ImageObjectViewWrapper(props: Props): React.ReactElement {
    const { image } = props;

    const textureRef = useRef<PIXI.Texture>(PIXI.Texture.EMPTY);

    useEffect(() => {
        textureRef.current = PIXI.Texture.from(image.srcFilePath);
    }, [image.srcFilePath]);

    return <ImageObjectView texture={textureRef.current} x={image.x} y={image.y} width={image.width} height={image.height} />;
}

export { ImageObjectViewWrapper as ImageObjectView };
