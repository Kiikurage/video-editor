import * as PIXI from 'pixi.js';
import { CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { HorizontalAlign, VerticalAlign } from '../../model/objects/FontStyle';
import { TextObject } from '../../model/objects/TextObject';
import { RendererProps } from './RendererProps';

const Align2Anchor: Record<HorizontalAlign | VerticalAlign, number> = {
    top: 0,
    left: 0,
    center: 0.5,
    bottom: 1,
    right: 1,
};

function applyProps(base: PIXI.Text, props: RendererProps<TextObject>) {
    const { object, timeInMS, canvasContext } = props;
    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, timeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, timeInMS);
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);

    const textStyle = base.style as PIXI.TextStyle;
    textStyle.fontFamily = object.fontStyle.fontFamily;
    textStyle.fontSize = object.fontStyle.fontSize;
    textStyle.fontWeight = object.fontStyle.fontWeight;
    textStyle.fill = object.fontStyle.fill;
    textStyle.stroke = object.fontStyle.stroke;
    textStyle.strokeThickness = object.fontStyle.strokeThickness;
    textStyle.breakWords = true;
    textStyle.wordWrap = true;
    textStyle.wordWrapWidth = width;
    textStyle.align = object.fontStyle.horizontalAlign;

    base.x = Math.round((x - canvasContext.left + width * Align2Anchor[object.fontStyle.horizontalAlign]) * canvasContext.scale);
    base.y = Math.round((y - canvasContext.top + height * Align2Anchor[object.fontStyle.verticalAlign]) * canvasContext.scale);
    base.width = Math.round(width * canvasContext.scale);
    base.height = Math.round(height * canvasContext.scale);
    base.text = object.text;
    base.scale.x = canvasContext.scale;
    base.scale.y = canvasContext.scale;
    base.anchor.x = Align2Anchor[object.fontStyle.horizontalAlign];
    base.anchor.y = Align2Anchor[object.fontStyle.verticalAlign];
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
