import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { snap } from '../../../lib/snap';
import { BaseObject } from '../../../model/objects/BaseObject';
import { attachPixiDragHandlers, detachPixiDragHandlers, PixiDragHandlers, usePixiDragHandlers } from '../../hooks/usePixiDragHandlers';
import { FocusRing } from '../FocusRing';

interface Props {
    object: BaseObject;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    isSelected: boolean;
    snapPositionXs: number[];
    onClick: () => void;
    onChange: (newX: number, newWidth: number) => void;
}

interface InnerProps {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    onClick: () => void;
    backgroundDragHandlers: PixiDragHandlers;
    wResizerDragHandlers: PixiDragHandlers;
    eResizerDragHandlers: PixiDragHandlers;
}

const ObjectView = CustomPIXIComponent(
    {
        customDisplayObject() {
            const base = new PIXI.Container();

            const textNode = new PIXI.Text('', {
                fill: 0x3465b5,
                fontSize: 10,
                fontWeight: 'normal',
            });
            textNode.name = 'text';
            textNode.mask = new PIXI.Graphics();
            base.addChild(textNode);
            base.addChild(textNode.mask);

            const background = new PIXI.Graphics();
            background.name = 'background';
            background.interactive = true;
            background.buttonMode = true;
            background.cursor = 'move';
            base.addChild(background);

            const eResizer = new PIXI.Sprite();
            eResizer.name = 'eResizer';
            eResizer.interactive = true;
            eResizer.buttonMode = true;
            eResizer.cursor = 'ew-resize';
            base.addChild(eResizer);

            const wResizer = new PIXI.Sprite();
            wResizer.name = 'wResizer';
            wResizer.interactive = true;
            wResizer.buttonMode = true;
            wResizer.cursor = 'ew-resize';
            base.addChild(wResizer);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: InnerProps, newProps: InnerProps): void {
            const { x, y, width, height, text, onClick, backgroundDragHandlers, wResizerDragHandlers, eResizerDragHandlers } = newProps;

            base.x = x;
            base.y = y;

            const textNode = base.getChildByName('text') as PIXI.Text;
            textNode.x = 4;
            textNode.y = 4;
            textNode.anchor.x = 0;
            textNode.anchor.y = 0;
            textNode.text = text;
            textNode.scale.x = 1;
            textNode.scale.y = 1;

            (textNode.mask as PIXI.Graphics).clear().beginFill(0xffffff, 1).drawRect(0, 0, width, height).endFill();

            const eResizer = base.getChildByName('eResizer') as PIXI.Graphics;
            eResizer.x = width - 8;
            eResizer.y = 0;
            eResizer.width = 8;
            eResizer.height = height;
            if (oldProps.eResizerDragHandlers) {
                detachPixiDragHandlers(eResizer, oldProps.eResizerDragHandlers);
            }
            if (eResizerDragHandlers) {
                attachPixiDragHandlers(eResizer, eResizerDragHandlers);
            }

            const wResizer = base.getChildByName('wResizer') as PIXI.Graphics;
            wResizer.x = 0;
            wResizer.y = 0;
            wResizer.width = 8;
            wResizer.height = height;
            if (oldProps.wResizerDragHandlers) {
                detachPixiDragHandlers(wResizer, oldProps.wResizerDragHandlers);
            }
            if (wResizerDragHandlers) {
                attachPixiDragHandlers(wResizer, wResizerDragHandlers);
            }

            const background = base.getChildByName('background') as PIXI.Graphics;
            background.clear();
            background.beginFill(0x4d90fe, 0.1);
            background.drawRoundedRect(0, 0, width, height, 4);
            background.endFill();
            if (oldProps.backgroundDragHandlers) {
                detachPixiDragHandlers(background, oldProps.backgroundDragHandlers);
            }
            if (backgroundDragHandlers) {
                attachPixiDragHandlers(background, backgroundDragHandlers);
            }
            if (oldProps.onClick) {
                background.off('mousedown', oldProps.onClick);
            }
            if (onClick) {
                background.on('mousedown', onClick);
            }
        },
    },
    'ObjectView'
);

function ObjectViewWrapper(props: Props): React.ReactElement {
    const { object, x, y, width, height, text, isSelected, snapPositionXs, onClick, onChange } = props;

    const [{ dx1, dx2 }, setDx] = useState({ dx1: 0, dx2: 0 });
    useEffect(() => {
        setDx({ dx1: 0, dx2: 0 });
    }, [object]);

    const backgroundDragHandlers = usePixiDragHandlers((dx, _dy, type) => {
        const newX1 = x + dx;
        const newX2 = x + width + dx;
        const snappedNewX1 = snap(newX1, snapPositionXs);
        const snappedNewX2 = snap(newX2, snapPositionXs);

        if (snappedNewX1 !== newX1) {
            dx = snappedNewX1 - x;
        } else if (snappedNewX2 !== newX2) {
            dx = snappedNewX2 - (x + width);
        }

        if (type === 'end' && dx !== 0) {
            onChange(x + dx, width);
        } else {
            setDx({ dx1: dx, dx2: dx });
        }
    });

    const wResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        ev.stopPropagation();

        dx = snap(x + dx, snapPositionXs) - x;

        if (type === 'end' && dx !== 0) {
            onChange(x + dx, width - dx);
        } else {
            setDx({ dx1: dx, dx2: 0 });
        }
    });

    const eResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        ev.stopPropagation();

        dx = snap(x + width + dx, snapPositionXs) - (x + width);

        if (type === 'end' && dx !== 0) {
            onChange(x, width + dx);
        } else {
            setDx({ dx1: 0, dx2: dx });
        }
    });

    return (
        <ObjectView
            x={x + dx1}
            y={y}
            width={width + dx2 - dx1}
            height={height}
            text={text}
            onClick={onClick}
            backgroundDragHandlers={backgroundDragHandlers}
            wResizerDragHandlers={wResizerDragHandlers}
            eResizerDragHandlers={eResizerDragHandlers}
        >
            <FocusRing isSelected={isSelected} width={width + dx2 - dx1} height={height} />
        </ObjectView>
    );
}

export { ObjectViewWrapper as ObjectView };
