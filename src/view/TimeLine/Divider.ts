import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';

interface Props {
    x: number;
    height: number;
    label: string;
    labeled: boolean;
}

export const Divider = CustomPIXIComponent(
    {
        customDisplayObject() {
            const base = new PIXI.Graphics();

            const textNode = new PIXI.Text('', {
                fontSize: 14,
                fill: 0xa0a0a0,
                fontWeight: 'normal',
            });
            textNode.name = 'text';
            base.addChild(textNode);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: Props, newProps: Props): void {
            const { x, height, label, labeled } = newProps;

            base.clear();
            base.lineStyle(1, labeled ? 0xc0c0c0 : 0xe8e8e8, 1);
            base.moveTo(x, labeled ? 20 : 28);
            base.lineTo(x, height);

            const textNode = base.getChildByName('text') as PIXI.Text;
            textNode.visible = labeled;
            textNode.text = label;
            textNode.anchor.x = 0.5;
            textNode.anchor.y = 0;
            textNode.x = x;
            textNode.y = 4;
        },
    },
    'Divider'
);
