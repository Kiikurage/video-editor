import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { BaseObject } from '../../../model/objects/BaseObject';
import { attachPixiDragHandlers, detachPixiDragHandlers, PixiDragHandlers, usePixiDragHandlers } from '../../hooks/usePixiDragHandlers';
import { quantizeTime } from '../../TimeLine';

interface Props {
    isSelected: boolean;
    text: string;
    object: BaseObject;
    y: number;
    fps: number;
    pixelPerSecond: number;
    offsetInMS: number;
    onClick: () => void;
    onChange: (newStartInMS: number, newEndInMS: number) => void;
}

interface InnerProps {
    isSelected: boolean;
    text: string;
    x: number;
    y: number;
    width: number;
    onClick: () => void;
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
        customApplyProps(base: PIXI.Graphics, oldProps: InnerProps, newProps: InnerProps): void {
            const { isSelected, text, x, y, width, onClick, baseDragHandlers, wResizerDragHandlers, eResizerDragHandlers } = newProps;

            const height = 22;

            base.x = x - 4;
            base.y = y;
            base.width = width + 8;
            base.height = height;
            base.scale.x = 1;
            base.scale.y = 1;
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
            textNode.y = height / 2;
            textNode.anchor.x = 0;
            textNode.anchor.y = 0.5;
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
    const { text, object, y, isSelected, pixelPerSecond, offsetInMS, onClick, onChange, fps } = props;

    const x1 = ((object.startInMS - offsetInMS) / 1000) * pixelPerSecond;
    const x2 = ((object.endInMS - offsetInMS) / 1000) * pixelPerSecond;
    const [dx1, setDx1] = useState(0);
    const [dx2, setDx2] = useState(0);

    const baseDragHandlers = usePixiDragHandlers((dx, _dy, type) => {
        if (type === 'end') {
            onChange(((x1 + dx) / pixelPerSecond) * 1000 + offsetInMS, ((x2 + dx) / pixelPerSecond) * 1000 + offsetInMS);
            setDx1(0);
            setDx2(0);
        } else {
            setDx1(dx);
            setDx2(dx);
        }
    });

    const wResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        ev.stopPropagation();

        if (type === 'end') {
            onChange(((x1 + dx) / pixelPerSecond) * 1000 + offsetInMS, object.endInMS);
            setDx1(0);
        } else {
            setDx1(dx);
        }
    });

    const eResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        ev.stopPropagation();

        if (type === 'end') {
            onChange(object.startInMS, ((x2 + dx) / pixelPerSecond) * 1000 + offsetInMS);
            setDx2(0);
        } else {
            setDx2(dx);
        }
    });

    const qx1 = ((quantizeTime(((x1 + dx1) * 1000) / pixelPerSecond + offsetInMS, fps) - offsetInMS) * pixelPerSecond) / 1000;
    const qx2 = ((quantizeTime(((x2 + dx2) * 1000) / pixelPerSecond + offsetInMS, fps) - offsetInMS) * pixelPerSecond) / 1000;

    return (
        <ObjectView
            text={text}
            x={qx1}
            y={y}
            width={qx2 - qx1}
            isSelected={isSelected}
            onClick={onClick}
            baseDragHandlers={baseDragHandlers}
            wResizerDragHandlers={wResizerDragHandlers}
            eResizerDragHandlers={eResizerDragHandlers}
        />
    );
}

export { ObjectViewWrapper as ObjectView };
