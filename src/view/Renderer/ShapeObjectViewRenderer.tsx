import * as PIXI from 'pixi.js';
import { CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { ShapeFrame } from '../../model/frame/ShapeFrame';
import { RendererProps } from './RendererProps';

const ShapeRendererMap: Record<string, (base: PIXI.Graphics, props: RendererProps<ShapeFrame>) => void> = {
    ['RECTANGLE']: renderRectangle,
    ['CIRCLE']: renderCircle,
};

function renderRectangle(base: PIXI.Graphics, props: RendererProps<ShapeFrame>) {
    const { frame } = props;
    base.lineStyle(4, frame.stroke);
    base.beginFill(frame.fill);
    base.drawRect(0, 0, frame.width, frame.height);
    base.endFill();
}

function renderCircle(base: PIXI.Graphics, props: RendererProps<ShapeFrame>) {
    const { frame } = props;
    base.lineStyle(4, frame.stroke);
    base.beginFill(frame.fill);
    base.drawEllipse(frame.width / 2, frame.height / 2, frame.width / 2, frame.height / 2);
    base.endFill();
}

function applyProps(base: PIXI.Graphics, props: RendererProps<ShapeFrame>): void {
    const { frame } = props;

    base.x = frame.x;
    base.y = frame.y;
    base.clear();

    const shapeRenderer = ShapeRendererMap[frame.shapeType];
    if (shapeRenderer === undefined) {
        console.warn(`Unsupported shape type: ${frame.shapeType}`);
    } else {
        shapeRenderer(base, props);
    }
}

export const ShapeObjectViewRenderer: CustomPIXIComponentBehaviorDefinition<PIXI.Graphics, RendererProps<ShapeFrame>> = {
    customDisplayObject(props) {
        const base = new PIXI.Graphics();

        applyProps(base, props);

        return base;
    },
    customApplyProps: (base: PIXI.Graphics, oldProps: RendererProps<ShapeFrame>, newProps: RendererProps<ShapeFrame>) => {
        applyProps(base, newProps);
    },
};
