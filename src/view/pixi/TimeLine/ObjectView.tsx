import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { attachPixiDragHandlers, detachPixiDragHandlers, PixiDragHandlers, usePixiDragHandlers } from '../../hooks/usePixiDragHandlers';

interface Props {
    isSelected: boolean;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    onClick: () => void;
    onMoveAndResize: (newX: number, newWidth: number) => void;
}

interface StateProps {
    baseDragHandlers: PixiDragHandlers;
    wResizerDragHandlers: PixiDragHandlers;
    eResizerDragHandlers: PixiDragHandlers;
}

const ObjectView = CustomPIXIComponent(
    {
        customDisplayObject() {
            const base = new PIXI.Graphics();
            base.interactive = true;
            base.buttonMode = true;

            const textNode = new PIXI.Text('', {
                fill: 0x4d90fe,
                fontSize: 14,
                fontWeight: 'normal',
            });
            textNode.name = 'text';
            textNode.mask = new PIXI.Graphics();
            base.addChild(textNode);
            base.addChild(textNode.mask);

            const eResizer = new PIXI.Graphics();
            eResizer.name = 'eResizer';
            eResizer.interactive = true;
            eResizer.buttonMode = true;
            eResizer.cursor = 'ew-resize';
            base.addChild(eResizer);

            const wResizer = new PIXI.Graphics();
            wResizer.name = 'wResizer';
            wResizer.interactive = true;
            wResizer.buttonMode = true;
            wResizer.cursor = 'ew-resize';
            base.addChild(wResizer);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: Props & StateProps, newProps: Props & StateProps): void {
            const {
                isSelected,
                text,
                x,
                y,
                width,
                height,
                onClick,
                baseDragHandlers,
                wResizerDragHandlers,
                eResizerDragHandlers,
            } = newProps;
            base.x = x - 4;
            base.y = y;
            base.width = width + 8;
            base.height = height;
            base.clear();
            if (isSelected) {
                base.lineStyle(2, 0x4d90fe, 1);
                base.beginFill(0x4d90fe, 0.3);
            } else {
                base.lineStyle(1, 0x4d90fe, 0.5);
                base.beginFill(0x4d90fe, 0.1);
            }
            base.drawRect(4 + base.line.width, base.line.width, width - base.line.width * 2, height - base.line.width * 2);
            base.endFill();
            if (oldProps.baseDragHandlers) {
                detachPixiDragHandlers(base, oldProps.baseDragHandlers);
                base.off('mousedown', oldProps.onClick);
            }
            attachPixiDragHandlers(base, baseDragHandlers);
            base.on('mousedown', onClick);

            const textNode = base.getChildByName('text') as PIXI.Text;
            textNode.x = 8;
            textNode.y = (height - 14) / 2;
            textNode.text = text;

            const textNodeMask = textNode.mask as PIXI.Graphics;
            textNodeMask.x = 4;
            textNodeMask.y = 0;
            textNodeMask.width = width - 8;
            textNodeMask.height = height;
            textNodeMask.clear();
            textNodeMask.beginFill(0xffffff);
            textNodeMask.drawRect(0, 0, width - 8, height);
            textNodeMask.endFill();

            const eResizer = base.getChildByName('eResizer') as PIXI.Graphics;
            eResizer.x = width;
            eResizer.y = 0;
            eResizer.width = 8;
            eResizer.height = height;
            eResizer.clear();
            eResizer.beginFill(0xffffff, 0.01);
            eResizer.drawRect(0, 0, 8, height);
            eResizer.endFill();
            if (oldProps.eResizerDragHandlers) {
                detachPixiDragHandlers(eResizer, oldProps.eResizerDragHandlers);
            }
            attachPixiDragHandlers(eResizer, eResizerDragHandlers);

            const wResizer = base.getChildByName('wResizer') as PIXI.Graphics;
            wResizer.x = 0;
            wResizer.y = 0;
            wResizer.width = 8;
            wResizer.height = height;
            wResizer.clear();
            wResizer.beginFill(0xffffff, 0.01);
            wResizer.drawRect(0, 0, 8, height);
            wResizer.endFill();
            if (oldProps.eResizerDragHandlers) {
                detachPixiDragHandlers(wResizer, oldProps.wResizerDragHandlers);
            }
            attachPixiDragHandlers(wResizer, wResizerDragHandlers);
        },
    },
    'ObjectView'
);

function ObjectViewWrapper(props: Props): React.ReactElement {
    const [x, setX] = useState(props.x);
    useEffect(() => setX(props.x), [props.x]);

    const [width, setWidth] = useState(props.width);
    useEffect(() => setWidth(props.width), [props.width]);

    const baseDragHandlers = usePixiDragHandlers((dx, _dy, type) => {
        const newX = props.x + dx;
        setX(newX);

        if (type === 'end') {
            props.onMoveAndResize(newX, width);
        }
    });

    const wResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        const newX = props.x + dx;
        const newWidth = props.width - dx;
        setX(newX);
        setWidth(newWidth);

        if (type === 'start') {
            ev.stopPropagation();
        } else if (type === 'end') {
            props.onMoveAndResize(newX, newWidth);
        }
    });

    const eResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        const newWidth = props.width + dx;
        setWidth(newWidth);

        if (type === 'start') {
            ev.stopPropagation();
        } else if (type === 'end') {
            props.onMoveAndResize(x, newWidth);
        }
    });

    return (
        <ObjectView
            {...props}
            x={x}
            width={width}
            baseDragHandlers={baseDragHandlers}
            wResizerDragHandlers={wResizerDragHandlers}
            eResizerDragHandlers={eResizerDragHandlers}
        />
    );
}

export { ObjectViewWrapper as ObjectView };
