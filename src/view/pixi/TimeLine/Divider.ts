import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';

interface Props {
    x: number;
    height: number;
    label: string;
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
            const { x, height, label } = newProps;

            base.clear();
            base.lineStyle(1, 0xe0e0e0, 1);
            base.moveTo(x, 0);
            base.lineTo(x, height);

            const textNode = base.getChildAt(0) as PIXI.Text;
            textNode.text = label;
            textNode.x = x - (textNode.width + 4);
            textNode.y = 4;
        },
    },
    'Divider'
);
