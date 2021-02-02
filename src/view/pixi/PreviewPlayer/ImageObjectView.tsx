import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { ImageObject } from '../../../model/objects/ImageObject';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import { ResizeView } from './ResizeView';

interface Props {
    image: ImageObject;
    selected: boolean;
    onSelect: () => void;
    onObjectChange: (oldValue: ImageObject, newValue: ImageObject) => void;
}

interface InnerProps {
    texture: PIXI.Texture;
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
            const { texture, width, height } = newProps;

            base.x = 0;
            base.y = 0;
            base.width = width;
            base.height = height;
            base.texture = texture;
        },
    },
    'ImageObjectView'
);

function ImageObjectViewWrapper(props: Props): React.ReactElement {
    const { image, selected, onSelect, onObjectChange } = props;

    const [texture, setTexture] = useState(PIXI.Texture.EMPTY);
    useEffect(() => {
        setTexture(PIXI.Texture.from(image.srcFilePath));
    }, [image.srcFilePath]);

    const onClick = useCallbackRef(() => {
        onSelect();
    });

    return (
        <ResizeView object={image} onObjectChange={onObjectChange} onSelect={onClick} selected={selected}>
            <ImageObjectView texture={texture} width={image.width} height={image.height} />
        </ResizeView>
    );
}

export { ImageObjectViewWrapper as ImageObjectView };
