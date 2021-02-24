import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { DIR } from './DIR';

const RESIZER_SIZE = 10;

interface PixiProps {
    x: number;
    y: number;
    width: number;
    height: number;
    onMouseDown: (ev: PIXI.InteractionEvent, dirX: -1 | 0 | 1, dirY: -1 | 0 | 1) => void;
}

function applyProps(base: PIXI.Container, props: PixiProps) {
    const { x, y, width, height } = props;

    base.x = x;
    base.y = y;

    const frame = base.getChildByName('frame') as PIXI.Graphics;
    frame.visible = true;
    frame.interactive = true;
    frame.cursor = 'move';
    frame.clear();
    frame.lineStyle(1, 0x4d90fe, 1);
    frame.drawRect(0, 0, width, height);
    frame.hitArea = new PIXI.Rectangle(0, 0, width, height);

    for (const { name, cursor, dirX, dirY } of DIR) {
        const resizer = base.getChildByName(name) as PIXI.Graphics;
        resizer.x = -RESIZER_SIZE / 2;
        resizer.y = -RESIZER_SIZE / 2;
        resizer.interactive = true;
        resizer.buttonMode = true;
        resizer.clear();
        resizer.lineStyle(1, 0xffffff, 1);
        resizer.beginFill(0x4d90fe, 1);
        resizer.drawRect(
            dirX === -1 ? 0 : dirX === 1 ? width : width / 2,
            dirY === -1 ? 0 : dirY === 1 ? height : height / 2,
            RESIZER_SIZE,
            RESIZER_SIZE
        );
        resizer.endFill();
        resizer.cursor = cursor;
    }
}

export const Resizer = CustomPIXIComponent(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Container();

            const frame = new PIXI.Graphics();
            frame.name = 'frame';
            base.addChild(frame);

            for (const { name } of DIR) {
                const resizer = new PIXI.Graphics();
                resizer.name = name;
                base.addChild(resizer);
            }

            applyProps(base, props);
            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);

            const frame = base.getChildByName('frame') as PIXI.Graphics;

            if (oldProps.onMouseDown !== newProps.onMouseDown) {
                frame.removeListener('mousedown');
                frame.on('mousedown', (ev: PIXI.InteractionEvent) => newProps.onMouseDown(ev, 0, 0));

                for (const { name, dirX, dirY } of DIR) {
                    const resizer = base.getChildByName(name) as PIXI.Graphics;
                    resizer.removeListener('mousedown');
                    resizer.on('mousedown', (ev: PIXI.InteractionEvent) => newProps.onMouseDown(ev, dirX, dirY));
                }
            }
        },
    },
    'Resizer'
);
