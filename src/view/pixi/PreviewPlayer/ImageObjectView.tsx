import * as PIXI from 'pixi.js';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { ImageObject } from '../../../model/ImageObject';
import { useCallbackRef } from '../../hooks/useCallbackRef';

interface Props {
    image: ImageObject;
    selected: boolean;
    onSelect: () => void;
}

interface InnerProps {
    texture: PIXI.Texture;
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    onClick: (ev: PIXI.InteractionEvent) => void;
}

const ImageObjectView = CustomPIXIComponent(
    {
        customDisplayObject() {
            const base = new PIXI.Container();
            base.interactive = true;
            base.buttonMode = true;
            base.cursor = 'pointer';

            const sprite = new PIXI.Sprite();
            sprite.name = 'sprite';
            base.addChild(sprite);

            const controlFrame = new PIXI.Graphics();
            controlFrame.name = 'controlFrame';
            base.addChild(controlFrame);

            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: InnerProps, newProps: InnerProps): void {
            const { texture, x, y, width, height, selected, onClick } = newProps;

            base.x = x;
            base.y = y;
            base.width = width;
            base.height = height;
            base.off('mousedown', oldProps.onClick);
            base.on('mousedown', onClick);

            const sprite = base.getChildByName('sprite') as PIXI.Sprite;
            sprite.x = 0;
            sprite.y = 0;
            sprite.width = width;
            sprite.height = height;
            sprite.texture = texture;

            const controlFrame = base.getChildByName('controlFrame') as PIXI.Graphics;
            controlFrame.x = 0;
            controlFrame.y = 0;
            controlFrame.width = width;
            controlFrame.height = height;

            controlFrame.clear();
            if (selected) {
                controlFrame.lineStyle(8, 0x4d90fe, 1);
                controlFrame.drawRect(4, 4, width - 8, height - 8);
            }
        },
    },
    'ImageObjectView'
);

function ImageObjectViewWrapper(props: Props): React.ReactElement {
    const { image, selected, onSelect } = props;

    const [texture, setTexture] = useState(PIXI.Texture.EMPTY);
    useEffect(() => {
        setTexture(PIXI.Texture.from(image.srcFilePath));
    }, [image.srcFilePath]);

    const onClick = useCallbackRef(() => {
        onSelect();
    });

    return (
        <ImageObjectView
            texture={texture}
            x={image.x}
            y={image.y}
            width={image.width}
            height={image.height}
            selected={selected}
            onClick={onClick}
        />
    );
}

export { ImageObjectViewWrapper as ImageObjectView };
