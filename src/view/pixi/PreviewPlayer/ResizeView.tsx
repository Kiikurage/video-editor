import * as PIXI from 'pixi.js';
import * as React from 'react';
import { PropsWithChildren, useMemo } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { snap } from '../../../lib/snap';
import { BaseObject } from '../../../model/objects/BaseObject';
import { useFormState } from '../../hooks/useFormState';
import { attachPixiDragHandlers, detachPixiDragHandlers, PixiDragHandlers, usePixiDragHandlers } from '../../hooks/usePixiDragHandlers';

type ResizableObject = BaseObject & {
    x: number;
    y: number;
    width: number;
    height: number;
};

interface InnerProps {
    width: number;
    height: number;
    selected: boolean;
    object: ResizableObject;
}

interface PixiInnerProps {
    width: number;
    height: number;
    selected: boolean;
    object: ResizableObject;
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
    const { width, height, selected, children, object } = props;

    return (
        <PixiResizeViewInner width={width} height={height} selected={selected} object={object}>
            {children}
        </PixiResizeViewInner>
    );
}

interface Props<T extends ResizableObject> {
    object: T;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onObjectChange: (oldObject: T, newObject: T) => void;
    onSelect: () => void;
}

interface PixiProps {
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    locked: boolean;
    baseDragHandlers: PixiDragHandlers;
    resizerDragHandlers: Record<string, PixiDragHandlers>;
    object: ResizableObject;
}

const RESIZER_SIZE = 40;

const DIR = [
    { name: 'nwResizer', cursor: 'nwse-resize', x: -1, y: -1 },
    { name: 'nResizer', cursor: 'ns-resize', x: 0, y: -1 },
    { name: 'neResizer', cursor: 'nesw-resize', x: 1, y: -1 },
    { name: 'wResizer', cursor: 'ew-resize', x: -1, y: 0 },
    { name: 'eResizer', cursor: 'ew-resize', x: 1, y: 0 },
    { name: 'swResizer', cursor: 'nesw-resize', x: -1, y: 1 },
    { name: 'sResizer', cursor: 'ns-resize', x: 0, y: 1 },
    { name: 'seResizer', cursor: 'nwse-resize', x: 1, y: 1 },
];

function createResizer(name: string, cursor: string): PIXI.Graphics {
    const resizer = new PIXI.Graphics();
    resizer.interactive = true;
    resizer.buttonMode = true;
    resizer.width = RESIZER_SIZE;
    resizer.height = RESIZER_SIZE;
    resizer.lineStyle(4, 0xffffff, 1);
    resizer.beginFill(0x4d90fe, 1);
    resizer.drawRect(0, 0, RESIZER_SIZE, RESIZER_SIZE);
    resizer.endFill();
    resizer.name = name;
    resizer.cursor = cursor;
    return resizer;
}

const PixiResizeView = CustomPIXIComponent(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Container();
            base.interactive = true;
            base.buttonMode = true;
            base.cursor = props.locked ? 'default' : 'move';

            const frame = new PIXI.Graphics();
            frame.name = 'frame';
            base.addChild(frame);

            for (const { name, cursor } of DIR) {
                base.addChild(createResizer(name, props.locked ? 'default' : cursor));
            }

            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: PixiProps, newProps: PixiProps): void {
            const { x, y, width, height, selected, locked, baseDragHandlers, resizerDragHandlers } = newProps;

            for (const { name, x, y, cursor } of DIR) {
                const resizer = base.getChildByName(name) as PIXI.Graphics;
                resizer.visible = selected;
                resizer.x = x === -1 ? 0 : x === 1 ? width : width / 2;
                resizer.y = y === -1 ? 0 : y === 1 ? height : height / 2;
                resizer.width = RESIZER_SIZE;
                resizer.height = RESIZER_SIZE;
                resizer.cursor = locked ? 'default' : cursor;
                if (oldProps.resizerDragHandlers && oldProps.resizerDragHandlers[name]) {
                    detachPixiDragHandlers(resizer, oldProps.resizerDragHandlers[name]);
                }
                if (resizerDragHandlers && resizerDragHandlers[name]) {
                    attachPixiDragHandlers(resizer, resizerDragHandlers[name]);
                }
            }

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
            base.cursor = locked ? 'default' : 'move';
            if (oldProps.baseDragHandlers) {
                detachPixiDragHandlers(base, oldProps.baseDragHandlers);
            }
            if (baseDragHandlers) {
                attachPixiDragHandlers(base, baseDragHandlers);
            }
        },
    },
    'PixiResizeView'
);

export function ResizeView<T extends ResizableObject>(props: PropsWithChildren<Props<T>>): React.ReactElement {
    const { object, selected, snapPositionXs, snapPositionYs, onObjectChange, onSelect, children } = props;

    const [x, setX] = useFormState(object.x);
    const [y, setY] = useFormState(object.y);
    const [width, setWidth] = useFormState(object.width);
    const [height, setHeight] = useFormState(object.height);

    const baseDragHandlers = usePixiDragHandlers((dx, dy, type) => {
        if (object.locked) {
            if (type === 'start') onSelect();
            return;
        }

        const newX1 = Math.round(object.x + dx);
        const newX2 = Math.round(object.x + width + dx);
        const newY1 = Math.round(object.y + dy);
        const newY2 = Math.round(object.y + height + dy);
        const snappedNewX1 = snap(newX1, snapPositionXs, 30);
        const snappedNewX2 = snap(newX2, snapPositionXs, 30);
        const snappedNewY1 = snap(newY1, snapPositionYs, 30);
        const snappedNewY2 = snap(newY2, snapPositionYs, 30);

        if (snappedNewX1 !== newX1) {
            dx = snappedNewX1 - object.x;
        } else if (snappedNewX2 !== newX2) {
            dx = snappedNewX2 - (object.x + width);
        }

        if (snappedNewY1 !== newY1) {
            dy = snappedNewY1 - object.y;
        } else if (snappedNewY2 !== newY2) {
            dy = snappedNewY2 - (object.y + height);
        }

        setX(object.x + dx);
        setY(object.y + dy);

        if (type === 'start') {
            onSelect();
        } else if (type === 'end') {
            onObjectChange(object, {
                ...object,
                x: Math.round(object.x + dx),
                y: Math.round(object.y + dy),
            });
        }
    });

    const resizerDragHandlers: Record<string, PixiDragHandlers> = useMemo(() => ({}), []);
    for (const { name, x, y } of DIR) {
        // TODO: Don't Use react-hook inside for-loop
        // eslint-disable-next-line react-hooks/rules-of-hooks
        resizerDragHandlers[name] = usePixiDragHandlers((dx, dy, type, ev) => {
            if (object.locked) return;
            ev.stopPropagation();

            const x1 = Math.round(x === -1 ? snap(object.x + dx, snapPositionXs, 30) : object.x);
            const x2 = Math.round(x === 1 ? snap(object.x + object.width + dx, snapPositionXs, 30) : object.x + object.width);
            const y1 = Math.round(y === -1 ? snap(object.y + dy, snapPositionYs, 30) : object.y);
            const y2 = Math.round(y === 1 ? snap(object.y + object.height + dy, snapPositionYs, 30) : object.y + object.height);
            const w = Math.abs(x2 - x1);
            const h = Math.abs(y2 - y1);

            setX(Math.min(x1, x2));
            setY(Math.min(y1, y2));
            setWidth(w);
            setHeight(h);

            if (type === 'end') {
                onObjectChange(object, {
                    ...object,
                    x: Math.min(x1, x2),
                    y: Math.min(y1, y2),
                    width: w,
                    height: h,
                });
            }
        });
    }

    return (
        <PixiResizeView
            x={x}
            y={y}
            width={width}
            height={height}
            selected={selected}
            locked={object.locked}
            baseDragHandlers={baseDragHandlers}
            resizerDragHandlers={resizerDragHandlers}
            object={object}
        >
            <ResizeViewInner object={object} width={width} height={height} selected={selected}>
                {children}
            </ResizeViewInner>
        </PixiResizeView>
    );
}
