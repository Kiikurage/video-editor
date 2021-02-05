import * as PIXI from 'pixi.js';
import * as React from 'react';
import { PropsWithChildren } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { BaseObject } from '../../../model/objects/BaseObject';
import { useFormState } from '../../hooks/useFormState';
import { attachPixiDragHandlers, detachPixiDragHandlers, PixiDragHandlers, usePixiDragHandlers } from '../../hooks/usePixiDragHandlers';

interface InnerProps {
    width: number;
    height: number;
    selected: boolean;
}

interface PixiInnerProps {
    width: number;
    height: number;
    selected: boolean;
}

const PixiResizeViewInner = CustomPIXIComponent(
    {
        customDisplayObject() {
            return new PIXI.Graphics();
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiInnerProps, newProps: PixiInnerProps): void {
            const { width, height, selected } = newProps;

            base.x = selected ? RESIZER_SIZE / 2 : 0;
            base.y = selected ? RESIZER_SIZE / 2 : 0;
            base.width = width;
            base.height = height;
        },
    },
    'PixiResizeViewInner'
);

function ResizeViewInner(props: PropsWithChildren<InnerProps>): React.ReactElement {
    const { width, height, selected, children } = props;

    return (
        <PixiResizeViewInner width={width} height={height} selected={selected}>
            {children}
        </PixiResizeViewInner>
    );
}

interface Props<T extends BaseObject> {
    object: T;
    selected: boolean;
    onObjectChange: (newValue: T) => void;
    onSelect: () => void;
}

interface PixiProps {
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    baseDragHandlers: PixiDragHandlers;
    nwDragHandlers: PixiDragHandlers;
    neDragHandlers: PixiDragHandlers;
    swDragHandlers: PixiDragHandlers;
    seDragHandlers: PixiDragHandlers;
}

const RESIZER_SIZE = 40;

const PixiResizeView = CustomPIXIComponent(
    {
        customDisplayObject() {
            const base = new PIXI.Container();
            base.interactive = true;
            base.buttonMode = true;
            base.cursor = 'pointer';

            const frame = new PIXI.Graphics();
            frame.name = 'frame';
            base.addChild(frame);

            const nwResizer = new PIXI.Graphics();
            nwResizer.interactive = true;
            nwResizer.buttonMode = true;
            nwResizer.width = RESIZER_SIZE;
            nwResizer.height = RESIZER_SIZE;
            nwResizer.lineStyle(4, 0xffffff, 1);
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
            swResizer.lineStyle(4, 0xffffff, 1);
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
            neResizer.lineStyle(4, 0xffffff, 1);
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
            seResizer.lineStyle(4, 0xffffff, 1);
            seResizer.beginFill(0x4d90fe, 1);
            seResizer.drawRect(0, 0, RESIZER_SIZE, RESIZER_SIZE);
            seResizer.endFill();
            seResizer.name = 'seResizer';
            seResizer.cursor = 'nwse-resize';
            base.addChild(seResizer);

            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: PixiProps, newProps: PixiProps): void {
            const {
                x,
                y,
                width,
                height,
                selected,
                baseDragHandlers,
                nwDragHandlers,
                neDragHandlers,
                swDragHandlers,
                seDragHandlers,
            } = newProps;

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

            const frame = base.getChildByName('frame') as PIXI.Graphics;
            frame.visible = selected;
            frame.x = RESIZER_SIZE / 2;
            frame.y = RESIZER_SIZE / 2;
            frame.width = width;
            frame.height = height;
            frame.clear();
            frame.lineStyle(4, 0x4d90fe, 1);
            frame.drawRect(0, 0, width, height);

            base.x = x - (selected ? RESIZER_SIZE / 2 : 0);
            base.y = y - (selected ? RESIZER_SIZE / 2 : 0);
            base.width = width + (selected ? RESIZER_SIZE : 0);
            base.height = height + (selected ? RESIZER_SIZE : 0);
            if (oldProps.baseDragHandlers) {
                detachPixiDragHandlers(base, oldProps.baseDragHandlers);
            }
            attachPixiDragHandlers(base, baseDragHandlers);
        },
    },
    'PixiResizeView'
);

export function ResizeView<T extends BaseObject>(props: PropsWithChildren<Props<T>>): React.ReactElement {
    const { object, selected, onObjectChange, onSelect, children } = props;

    const [x, setX] = useFormState(object.x);
    const [y, setY] = useFormState(object.y);
    const [width, setWidth] = useFormState(object.width);
    const [height, setHeight] = useFormState(object.height);

    const baseDragHandlers = usePixiDragHandlers((dx, dy, type) => {
        setX(object.x + dx);
        setY(object.y + dy);

        if (type === 'start') {
            onSelect();
        } else if (type === 'end') {
            onObjectChange({
                ...object,
                x: object.x + dx,
                y: object.y + dy,
            });
        }
    });

    const nwDragHandlers = usePixiDragHandlers((dx, dy, type, ev) => {
        ev.stopPropagation();
        setX(object.x + dx);
        setY(object.y + dy);
        setWidth(object.width - dx);
        setHeight(object.height - dy);

        if (type === 'end') {
            onObjectChange({
                ...object,
                x: object.x + dx,
                y: object.y + dy,
                width: object.width - dx,
                height: object.height - dy,
            });
        }
    });

    const neDragHandlers = usePixiDragHandlers((dx, dy, type, ev) => {
        ev.stopPropagation();
        setY(object.y + dy);
        setWidth(object.width + dx);
        setHeight(object.height - dy);

        if (type === 'end') {
            onObjectChange({
                ...object,
                y: object.y + dy,
                width: object.width + dx,
                height: object.height - dy,
            });
        }
    });

    const swDragHandlers = usePixiDragHandlers((dx, dy, type, ev) => {
        ev.stopPropagation();
        setX(object.x + dx);
        setWidth(object.width - dx);
        setHeight(object.height + dy);

        if (type === 'end') {
            onObjectChange({
                ...object,
                x: object.x + dx,
                width: object.width - dx,
                height: object.height + dy,
            });
        }
    });

    const seDragHandlers = usePixiDragHandlers((dx, dy, type, ev) => {
        ev.stopPropagation();
        setWidth(object.width + dx);
        setHeight(object.height + dy);

        if (type === 'end') {
            onObjectChange({
                ...object,
                width: object.width + dx,
                height: object.height + dy,
            });
        }
    });

    return (
        <PixiResizeView
            x={x}
            y={y}
            width={width}
            height={height}
            selected={selected}
            baseDragHandlers={baseDragHandlers}
            nwDragHandlers={nwDragHandlers}
            neDragHandlers={neDragHandlers}
            swDragHandlers={swDragHandlers}
            seDragHandlers={seDragHandlers}
        >
            <ResizeViewInner width={width} height={height} selected={selected}>
                {children}
            </ResizeViewInner>
        </PixiResizeView>
    );
}
