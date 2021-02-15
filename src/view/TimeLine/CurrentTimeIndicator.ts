import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';

interface PixiProps {
    x: number;
    height: number;
}

function applyProps(base: PIXI.Graphics, props: PixiProps) {
    const { x, height } = props;

    base.x = Math.round(x) - 4;

    base.clear();
    base.lineStyle(1, 0xff0000, 1);
    base.moveTo(4, 0);
    base.lineTo(4, height);

    base.beginFill(0xff0000, 1);
    base.drawPolygon([0, 0, 8, 0, 8, 6, 4, 10, 0, 6]);
    base.endFill();
}

export const CurrentTimeIndicator = CustomPIXIComponent<PIXI.Graphics, PixiProps>(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Graphics();

            applyProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);
        },
    },
    'CurrentTimeIndicator'
);
