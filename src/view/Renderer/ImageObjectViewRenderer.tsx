import * as PIXI from 'pixi.js';
import { CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { ImageObject } from '../../model/objects/ImageObject';
import { RendererProps } from './RendererProps';

function applyProps(base: PIXI.Sprite, props: RendererProps<ImageObject>) {
    const { object, canvasContext, timeInMS } = props;
    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, timeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, timeInMS);
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);

    base.x = (x - canvasContext.left) * canvasContext.scale;
    base.y = (y - canvasContext.top) * canvasContext.scale;
    base.width = width * canvasContext.scale;
    base.height = height * canvasContext.scale;
}

export const ImageObjectViewRenderer: CustomPIXIComponentBehaviorDefinition<PIXI.Sprite, RendererProps<ImageObject>> = {
    customDisplayObject(props) {
        const base = new PIXI.Sprite();

        applyProps(base, props);
        base.texture = PIXI.Texture.from(props.object.srcFilePath);

        return base;
    },
    customApplyProps(base, oldProps, newProps) {
        applyProps(base, newProps);

        if (oldProps.object?.srcFilePath !== newProps.object.srcFilePath) {
            base.texture = PIXI.Texture.from(newProps.object.srcFilePath);
        }
    },
};
