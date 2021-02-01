import * as PIXI from 'pixi.js';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { BaseObject } from '../../../model/BaseObject';
import { ImageObject } from '../../../model/ImageObject';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import { useFormState } from '../../hooks/useFormState';
import { attachPixiDragHandlers, detachPixiDragHandlers, PixiDragHandlers, usePixiDragHandlers } from '../../hooks/usePixiDragHandlers';

interface Props {
    image: ImageObject;
    selected: boolean;
    onSelect: () => void;
    onObjectChange: (oldValue: BaseObject, newValue: BaseObject) => void;
}

interface InnerProps {
    texture: PIXI.Texture;
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    onClick: (ev: PIXI.InteractionEvent) => void;
    baseDragHandlers: PixiDragHandlers;
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
            const { texture, x, y, width, height, selected, onClick, baseDragHandlers } = newProps;

            base.x = x;
            base.y = y;
            base.width = width;
            base.height = height;
            base.off('mousedown', oldProps.onClick);
            base.on('mousedown', onClick);
            if (oldProps.baseDragHandlers) {
                detachPixiDragHandlers(base, oldProps.baseDragHandlers);
            }
            attachPixiDragHandlers(base, baseDragHandlers);

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
    const { image, selected, onSelect, onObjectChange } = props;

    const [x, setX] = useFormState(image.x);
    const [y, setY] = useFormState(image.y);

    const [texture, setTexture] = useState(PIXI.Texture.EMPTY);
    useEffect(() => {
        setTexture(PIXI.Texture.from(image.srcFilePath));
    }, [image.srcFilePath]);

    const onClick = useCallbackRef(() => {
        onSelect();
    });

    const baseDragHandlers = usePixiDragHandlers((dx, dy, type) => {
        setX(image.x + dx);
        setY(image.y + dy);

        if (type === 'end') {
            onObjectChange(image, {
                ...image,
                x: image.x + dx,
                y: image.y + dy,
            });
        }
    });

    return (
        <ImageObjectView
            texture={texture}
            x={x}
            y={y}
            width={image.width}
            height={image.height}
            selected={selected}
            onClick={onClick}
            baseDragHandlers={baseDragHandlers}
        />
    );
}

export { ImageObjectViewWrapper as ImageObjectView };
