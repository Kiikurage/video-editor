import * as PIXI from 'pixi.js';
import { CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { ShapeObject, ShapeType } from '../../model/objects/ShapeObject';
import { RendererProps } from './RendererProps';

const ShapeRendererMap: Record<ShapeType, (base: PIXI.Graphics, props: RendererProps<ShapeObject>) => void> = {
    [ShapeType.RECTANGLE]: renderRectangle,
    [ShapeType.CIRCLE]: renderCircle,
};

function renderRectangle(base: PIXI.Graphics, props: RendererProps<ShapeObject>) {
    const { object, timeInMS } = props;
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);
    const fill = AnimatableValue.interpolate(object.fill, object.startInMS, object.endInMS, timeInMS);
    const stroke = AnimatableValue.interpolate(object.stroke, object.startInMS, object.endInMS, timeInMS);

    base.lineStyle(4, stroke);
    base.beginFill(fill);
    base.drawRect(0, 0, width, height);
    base.endFill();
}

function renderCircle(base: PIXI.Graphics, props: RendererProps<ShapeObject>) {
    const { object, timeInMS } = props;
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);
    const fill = AnimatableValue.interpolate(object.fill, object.startInMS, object.endInMS, timeInMS);
    const stroke = AnimatableValue.interpolate(object.stroke, object.startInMS, object.endInMS, timeInMS);

    base.lineStyle(4, stroke);
    base.beginFill(fill);
    base.drawEllipse(width / 2, height / 2, width / 2, height / 2);
    base.endFill();
}

function applyProps(base: PIXI.Graphics, props: RendererProps<ShapeObject>) {
    const { object, canvasContext, timeInMS } = props;

    base.x = (AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, timeInMS) - canvasContext.left) * canvasContext.scale;
    base.y = (AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, timeInMS) - canvasContext.top) * canvasContext.scale;
    base.scale.x = canvasContext.scale;
    base.scale.y = canvasContext.scale;
    base.clear();

    const shapeRenderer = ShapeRendererMap[object.shapeType];
    if (shapeRenderer === undefined) {
        console.warn(`Unsupported shape type: ${object.shapeType}`);
    } else {
        shapeRenderer(base, props);
    }
}

export const ShapeObjectViewRenderer: CustomPIXIComponentBehaviorDefinition<PIXI.Graphics, RendererProps<ShapeObject>> = {
    customDisplayObject(props) {
        const base = new PIXI.Graphics();

        applyProps(base, props);

        return base;
    },
    customApplyProps(base, oldObject, newObject) {
        applyProps(base, newObject);
    },
};
