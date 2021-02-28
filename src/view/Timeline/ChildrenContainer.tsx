import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';

interface PixiProps {
    x: number;
    y: number;
    width: number;
    height: number;
}

function applyProps(base: PIXI.Container, props: PixiProps) {
    const { x, y, width, height } = props;
    base.x = x;
    base.y = y;
    base.width = width;
    base.height = height;
    base.scale.x = 1;
    base.scale.y = 1;

    const mask = base.mask as PIXI.Graphics;
    mask.clear();
    mask.beginFill(0xffffff, 1);
    mask.drawRect(0, 0, width, height);
    mask.endFill();
}

export const ChildrenContainer = CustomPIXIComponent<PIXI.Container, PixiProps>(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Container();
            base.mask = new PIXI.Graphics();
            base.addChild(base.mask);
            applyProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);
        },
    },
    'ChildrenContainer'
);
