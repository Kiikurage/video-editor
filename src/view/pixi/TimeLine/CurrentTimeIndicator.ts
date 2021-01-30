import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';

interface Props {
    x: number;
    height: number;
}

export const CurrentTimeIndicator = CustomPIXIComponent(
    {
        customDisplayObject() {
            return new PIXI.Graphics();
        },
        customApplyProps(instance: PIXI.Graphics, oldProps: Props, newProps: Props): void {
            const { x, height } = newProps;

            instance.clear();
            instance.lineStyle(1, 0x000000, 1);
            instance.moveTo(x, 0);
            instance.lineTo(x, height);
        },
    },
    'CurrentTimeIndicator'
);
