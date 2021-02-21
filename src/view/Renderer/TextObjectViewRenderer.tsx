import * as PIXI from 'pixi.js';
import { CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { TextObject } from '../../model/objects/TextObject';
import { RendererProps } from './RendererProps';

function applyProps(base: PIXI.Text, props: RendererProps<TextObject>) {
    const { object, timeInMS, canvasContext } = props;
    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, timeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, timeInMS);
    // const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    // const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);

    base.x = (x - canvasContext.left) * canvasContext.scale;
    base.y = (y - canvasContext.top) * canvasContext.scale;
    // base.width = width * canvasContext.scale;
    // base.height = height * canvasContext.scale;
    base.text = object.text;
    base.scale.x = canvasContext.scale;
    base.scale.y = canvasContext.scale;

    const textStyle = base.style as PIXI.TextStyle;
    textStyle.fontFamily = object.fontStyle.fontFamily;
    textStyle.fontSize = object.fontStyle.fontSize;
    textStyle.fontWeight = object.fontStyle.fontWeight;
    textStyle.fill = object.fontStyle.fill;
    textStyle.stroke = object.fontStyle.stroke;
    textStyle.strokeThickness = object.fontStyle.strokeThickness;

    return base;
}

export const TextObjectViewRenderer: CustomPIXIComponentBehaviorDefinition<PIXI.Text, RendererProps<TextObject>> = {
    customDisplayObject(props): PIXI.Text {
        const base = new PIXI.Text('');

        applyProps(base, props);

        return base;
    },
    customApplyProps(base, oldProps, newProps): void {
        applyProps(base, newProps);
    },
};
