import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

interface Props {
    isSelected: boolean;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    onClick: () => void;
}

export const ObjectView = CustomPIXIComponent(
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

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: Props, newProps: Props): void {
            const { isSelected, text, x, y, width, height, onClick } = newProps;
            base.clear();
            if (isSelected) {
                base.lineStyle(2, 0x4d90fe, 1);
                base.beginFill(0x4d90fe, 0.3);
            } else {
                base.lineStyle(1, 0x4d90fe, 0.5);
                base.beginFill(0x4d90fe, 0.1);
            }
            base.drawRect(x, y, width, height);
            base.endFill();
            if (oldProps) {
                base.off('pointerdown', oldProps.onClick);
            }
            base.on('pointerdown', onClick);

            const textNode = base.getChildByName('text') as PIXI.Text;
            textNode.text = text;
            textNode.x = x + 4;
            textNode.y = y + 1;

            const textNodeMask = textNode.mask as PIXI.Graphics;
            textNodeMask.clear();
            textNodeMask.beginFill(0xffffff);
            textNodeMask.drawRect(x, y, width, height);
            textNodeMask.endFill();
        },
    },
    'ObjectView'
);
