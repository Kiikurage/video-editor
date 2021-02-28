import * as PIXI from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';

interface PixiProps {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    onMouseDown: (ev: PIXI.InteractionEvent, id: string) => void;
    onMouseUp: (ev: PIXI.InteractionEvent, id: string) => void;
}

function applyProps(base: PIXI.Container, props: PixiProps) {
    const { x, y, width, height, selected } = props;

    base.x = x;
    base.y = y;

    const frame = base.getChildByName('frame') as PIXI.Graphics;
    frame.visible = true;
    frame.interactive = true;
    frame.clear();
    if (selected) {
        frame.lineStyle(6, 0x4d90fe, 0.2);
        frame.drawRect(0, 0, width, height);
    }
    frame.hitArea = new PIXI.Rectangle(0, 0, width, height);
}

export const FocusArea = CustomPIXIComponent(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Container();

            const frame = new PIXI.Graphics();
            frame.name = 'frame';
            base.addChild(frame);

            applyProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);

            const frame = base.getChildByName('frame') as PIXI.Graphics;

            if (oldProps.onMouseUp !== newProps.onMouseUp) {
                frame.removeListener('mouseup');
                frame.on('mouseup', (ev: PIXI.InteractionEvent) => newProps.onMouseUp(ev, newProps.id));
            }
            if (oldProps.onMouseDown !== newProps.onMouseDown) {
                frame.removeListener('mousedown');
                frame.on('mousedown', (ev: PIXI.InteractionEvent) => newProps.onMouseDown(ev, newProps.id));
            }
        },
    },
    'FocusArea'
);
