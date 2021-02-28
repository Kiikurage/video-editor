import * as PIXI from 'pixi.js';
import { CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { ImageFrame } from '../../model/frame/ImageFrame';
import { RendererProps } from './RendererProps';

function applyProps(base: PIXI.Sprite, props: RendererProps<ImageFrame>) {
    const { frame } = props;
    const x = frame.x;
    const y = frame.y;
    const width = frame.width;
    const height = frame.height;

    base.x = x;
    base.y = y;
    base.width = width;
    base.height = height;
}

export const ImageObjectViewRenderer: CustomPIXIComponentBehaviorDefinition<PIXI.Sprite, RendererProps<ImageFrame>> = {
    customDisplayObject(props) {
        const base = new PIXI.Sprite();

        applyProps(base, props);
        base.texture = PIXI.Texture.from(props.frame.srcFilePath);

        return base;
    },
    customApplyProps(base, oldProps, newProps) {
        applyProps(base, newProps);

        if (oldProps.frame?.srcFilePath !== newProps.frame.srcFilePath) {
            base.texture = PIXI.Texture.from(newProps.frame.srcFilePath);
        }
    },
};
