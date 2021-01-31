import * as PIXI from 'pixi.js';
import { useState } from 'react';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { useCallbackRef } from '../../hooks/useCallbackRef';

interface Props {
    isSelected: boolean;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    onClick: () => void;
    onDragEnd: (newX: number) => void;
}

interface StateProps {
    dragStartX: number;
    interactionData: PIXI.InteractionData | null;
    onDragStart: (interactionData: PIXI.InteractionData, dragStartX: number) => void;
    onDragEnd: (newX: number) => void;
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

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: Props & StateProps, newProps: Props & StateProps): void {
            const { isSelected, text, x, y, width, height, onClick, onDragStart, onDragEnd, interactionData, dragStartX } = newProps;
            base.clear();
            if (isSelected) {
                base.lineStyle(2, 0x4d90fe, 1);
                base.beginFill(0x4d90fe, 0.3);
            } else {
                base.lineStyle(1, 0x4d90fe, 0.5);
                base.beginFill(0x4d90fe, 0.1);
            }
            base.drawRect(0, y, width, height);
            base.endFill();
            if (interactionData === null) {
                base.x = x;
            }

            if (oldProps) {
                base.off('mousedown', oldProps.onClick);
            }

            base.removeAllListeners('mousedown');
            base.on('mousedown', (ev: PIXI.InteractionEvent) => {
                onClick();
                onDragStart(ev.data, ev.data.getLocalPosition(base.parent).x - base.x);
            });

            base.removeAllListeners('mousemove');
            base.on('mousemove', () => {
                if (interactionData !== null) {
                    base.x = interactionData.getLocalPosition(base.parent).x - dragStartX;
                }
            });

            base.removeAllListeners('mouseup');
            base.on('mouseup', () => {
                if (interactionData !== null) {
                    base.x = interactionData.getLocalPosition(base.parent).x - dragStartX;
                    onDragEnd(base.x);
                }
            });

            base.removeAllListeners('mouseupoutside');
            base.on('mouseupoutside', () => {
                if (interactionData !== null) {
                    base.x = interactionData.getLocalPosition(base.parent).x - dragStartX;
                    onDragEnd(base.x);
                }
            });

            const textNode = base.getChildByName('text') as PIXI.Text;
            textNode.text = text;
            textNode.x = 4;
            textNode.y = y + 1;

            const textNodeMask = textNode.mask as PIXI.Graphics;
            textNodeMask.clear();
            textNodeMask.beginFill(0xffffff);
            textNodeMask.drawRect(0, y, width, height);
            textNodeMask.endFill();
        },
    },
    'ObjectView'
);

function ObjectViewWrapper(props: Props): React.ReactElement {
    const [interactionData, setInteractionData] = useState<PIXI.InteractionData | null>(null);
    const [dragStartX, setDragStartX] = useState(0);

    const onDragStart = useCallbackRef((interactionData: PIXI.InteractionData, dragStartX: number) => {
        setDragStartX(dragStartX);
        setInteractionData(interactionData);
    });

    const onDragEnd = useCallbackRef((newX: number) => {
        props.onDragEnd(newX);
        setDragStartX(0);
        setInteractionData(null);
    });

    return (
        <ObjectView {...props} dragStartX={dragStartX} onDragStart={onDragStart} onDragEnd={onDragEnd} interactionData={interactionData} />
    );
}

export { ObjectViewWrapper as ObjectView };
