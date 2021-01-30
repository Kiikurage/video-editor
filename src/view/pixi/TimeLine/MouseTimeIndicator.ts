import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';

interface Props {
    x: number;
    height: number;
}

export const MouseTimeIndicator = CustomPIXIComponent(
    {
        customDisplayObject() {
            return new PIXI.Graphics();
        },
        customApplyProps(instance: PIXI.Graphics, oldProps: Props, newProps: Props): void {
            const { x, height } = newProps;

            instance.clear();
            instance.lineStyle(2, 0x4d90fe, 1);
            instance.moveTo(x, 0);
            instance.lineTo(x, height);
        },
    },
    'MouseTimeIndicator'
);
