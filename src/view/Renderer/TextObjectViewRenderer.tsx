import * as PIXI from 'pixi.js';
import { CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { TextFrame } from '../../model/frame/TextFrame';
import { HorizontalAlign, VerticalAlign } from '../../model/objects/TextObject';
import { RendererProps } from './RendererProps';

const Align2Anchor: Record<HorizontalAlign | VerticalAlign, number> = {
    top: 0,
    left: 0,
    center: 0.5,
    bottom: 1,
    right: 1,
};

function applyProps(base: PIXI.Text, props: RendererProps<TextFrame>) {
    const { frame } = props;
    /**
     * Must set content before any other props
     */
    base.text = frame.text;

    const textStyle = base.style as PIXI.TextStyle;
    textStyle.fontFamily = frame.fontFamily;
    textStyle.fontSize = frame.fontSize;
    textStyle.fontWeight = frame.fontWeight;
    textStyle.fill = frame.fill;
    textStyle.stroke = frame.stroke;
    textStyle.strokeThickness = frame.strokeThickness;
    textStyle.breakWords = true;
    textStyle.wordWrap = true;
    textStyle.wordWrapWidth = frame.width;
    textStyle.align = frame.horizontalAlign;

    base.x = Math.round(frame.x + frame.width * Align2Anchor[frame.horizontalAlign]);
    base.y = Math.round(frame.y + frame.height * Align2Anchor[frame.verticalAlign]);
    base.width = frame.width;
    base.height = frame.height;
    base.scale.x = 1;
    base.scale.y = 1;
    base.anchor.x = Align2Anchor[frame.horizontalAlign];
    base.anchor.y = Align2Anchor[frame.verticalAlign];
}

export const TextObjectViewRenderer: CustomPIXIComponentBehaviorDefinition<PIXI.Text, RendererProps<TextFrame>> = {
    customDisplayObject(props): PIXI.Text {
        const base = new PIXI.Text('');

        applyProps(base, props);

        return base;
    },
    customApplyProps(base, oldProps, newProps): void {
        applyProps(base, newProps);
    },
};
