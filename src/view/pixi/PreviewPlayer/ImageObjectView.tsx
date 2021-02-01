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
    nwDragHandlers: PixiDragHandlers;
    neDragHandlers: PixiDragHandlers;
    swDragHandlers: PixiDragHandlers;
    seDragHandlers: PixiDragHandlers;
}

const RESIZER_SIZE = 30;

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

            const nwResizer = new PIXI.Graphics();
            nwResizer.interactive = true;
            nwResizer.buttonMode = true;
            nwResizer.width = RESIZER_SIZE;
            nwResizer.height = RESIZER_SIZE;
            nwResizer.beginFill(0x4d90fe, 1);
            nwResizer.drawRect(0, 0, RESIZER_SIZE, RESIZER_SIZE);
            nwResizer.endFill();
            nwResizer.name = 'nwResizer';
            nwResizer.cursor = 'nwse-resize';
            base.addChild(nwResizer);

            const swResizer = new PIXI.Graphics();
            swResizer.interactive = true;
            swResizer.buttonMode = true;
            swResizer.width = RESIZER_SIZE;
            swResizer.height = RESIZER_SIZE;
            swResizer.beginFill(0x4d90fe, 1);
            swResizer.drawRect(0, 0, RESIZER_SIZE, RESIZER_SIZE);
            swResizer.endFill();
            swResizer.name = 'swResizer';
            swResizer.cursor = 'nesw-resize';
            base.addChild(swResizer);

            const neResizer = new PIXI.Graphics();
            neResizer.interactive = true;
            neResizer.buttonMode = true;
            neResizer.width = RESIZER_SIZE;
            neResizer.height = RESIZER_SIZE;
            neResizer.beginFill(0x4d90fe, 1);
            neResizer.drawRect(0, 0, RESIZER_SIZE, RESIZER_SIZE);
            neResizer.endFill();
            neResizer.name = 'neResizer';
            neResizer.cursor = 'nesw-resize';
            base.addChild(neResizer);

            const seResizer = new PIXI.Graphics();
            seResizer.interactive = true;
            seResizer.buttonMode = true;
            seResizer.width = RESIZER_SIZE;
            seResizer.height = RESIZER_SIZE;
            seResizer.beginFill(0x4d90fe, 1);
            seResizer.drawRect(0, 0, RESIZER_SIZE, RESIZER_SIZE);
            seResizer.endFill();
            seResizer.name = 'seResizer';
            seResizer.cursor = 'nwse-resize';
            base.addChild(seResizer);

            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: InnerProps, newProps: InnerProps): void {
            const {
                texture,
                x,
                y,
                width,
                height,
                selected,
                onClick,
                baseDragHandlers,
                nwDragHandlers,
                neDragHandlers,
                swDragHandlers,
                seDragHandlers,
            } = newProps;

            const controlFrame = base.getChildByName('controlFrame') as PIXI.Graphics;
            controlFrame.visible = selected;
            controlFrame.x = RESIZER_SIZE / 2;
            controlFrame.y = RESIZER_SIZE / 2;
            controlFrame.width = width;
            controlFrame.height = height;
            controlFrame.clear();
            controlFrame.lineStyle(4, 0x4d90fe, 1);
            controlFrame.drawRect(0, 0, width, height);

            const nwResizer = base.getChildByName('nwResizer') as PIXI.Graphics;
            nwResizer.visible = selected;
            nwResizer.x = 0;
            nwResizer.y = 0;
            nwResizer.width = RESIZER_SIZE;
            nwResizer.height = RESIZER_SIZE;
            if (oldProps.nwDragHandlers) {
                detachPixiDragHandlers(nwResizer, nwDragHandlers);
            }
            attachPixiDragHandlers(nwResizer, nwDragHandlers);

            const neResizer = base.getChildByName('neResizer') as PIXI.Graphics;
            neResizer.visible = selected;
            neResizer.x = width;
            neResizer.y = 0;
            neResizer.width = RESIZER_SIZE;
            neResizer.height = RESIZER_SIZE;
            if (oldProps.neDragHandlers) {
                detachPixiDragHandlers(neResizer, neDragHandlers);
            }
            attachPixiDragHandlers(neResizer, neDragHandlers);

            const swResizer = base.getChildByName('swResizer') as PIXI.Graphics;
            swResizer.visible = selected;
            swResizer.x = 0;
            swResizer.y = height;
            swResizer.width = RESIZER_SIZE;
            swResizer.height = RESIZER_SIZE;
            if (oldProps.swDragHandlers) {
                detachPixiDragHandlers(swResizer, swDragHandlers);
            }
            attachPixiDragHandlers(swResizer, swDragHandlers);

            const seResizer = base.getChildByName('seResizer') as PIXI.Graphics;
            seResizer.visible = selected;
            seResizer.x = width;
            seResizer.y = height;
            seResizer.width = RESIZER_SIZE;
            seResizer.height = RESIZER_SIZE;
            if (oldProps.seDragHandlers) {
                detachPixiDragHandlers(seResizer, seDragHandlers);
            }
            attachPixiDragHandlers(seResizer, seDragHandlers);

            const sprite = base.getChildByName('sprite') as PIXI.Sprite;
            sprite.x = RESIZER_SIZE / 2;
            sprite.y = RESIZER_SIZE / 2;
            sprite.width = width;
            sprite.height = height;
            sprite.texture = texture;

            base.x = x;
            base.y = y;
            base.width = width + (selected ? RESIZER_SIZE : 0);
            base.height = height + (selected ? RESIZER_SIZE : 0);
            base.off('mousedown', oldProps.onClick);
            base.on('mousedown', onClick);
            if (oldProps.baseDragHandlers) {
                detachPixiDragHandlers(base, oldProps.baseDragHandlers);
            }
            attachPixiDragHandlers(base, baseDragHandlers);
        },
    },
    'ImageObjectView'
);

function ImageObjectViewWrapper(props: Props): React.ReactElement {
    const { image, selected, onSelect, onObjectChange } = props;

    const [x, setX] = useFormState(image.x);
    const [y, setY] = useFormState(image.y);
    const [width, setWidth] = useFormState(image.width);
    const [height, setHeight] = useFormState(image.height);

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

    const nwDragHandlers = usePixiDragHandlers((dx, dy, type, ev) => {
        ev.stopPropagation();
        setX(image.x + dx);
        setY(image.y + dy);
        setWidth(image.width - dx);
        setHeight(image.height - dy);

        if (type === 'end') {
            onObjectChange(image, {
                ...image,
                x: image.x + dx,
                y: image.y + dy,
                width: image.width - dx,
                height: image.height - dy,
            });
        }
    });

    const neDragHandlers = usePixiDragHandlers((dx, dy, type, ev) => {
        ev.stopPropagation();
        setY(image.y + dy);
        setWidth(image.width + dx);
        setHeight(image.height - dy);

        if (type === 'end') {
            onObjectChange(image, {
                ...image,
                y: image.y + dy,
                width: image.width + dx,
                height: image.height - dy,
            });
        }
    });

    const swDragHandlers = usePixiDragHandlers((dx, dy, type, ev) => {
        ev.stopPropagation();
        setX(image.x + dx);
        setWidth(image.width - dx);
        setHeight(image.height + dy);

        if (type === 'end') {
            onObjectChange(image, {
                ...image,
                x: image.x + dx,
                width: image.width - dx,
                height: image.height + dy,
            });
        }
    });

    const seDragHandlers = usePixiDragHandlers((dx, dy, type, ev) => {
        ev.stopPropagation();
        setWidth(image.width + dx);
        setHeight(image.height + dy);

        if (type === 'end') {
            onObjectChange(image, {
                ...image,
                width: image.width + dx,
                height: image.height + dy,
            });
        }
    });

    return (
        <ImageObjectView
            texture={texture}
            x={x}
            y={y}
            width={width}
            height={height}
            selected={selected}
            onClick={onClick}
            baseDragHandlers={baseDragHandlers}
            nwDragHandlers={nwDragHandlers}
            neDragHandlers={neDragHandlers}
            swDragHandlers={swDragHandlers}
            seDragHandlers={seDragHandlers}
        />
    );
}

export { ImageObjectViewWrapper as ImageObjectView };
