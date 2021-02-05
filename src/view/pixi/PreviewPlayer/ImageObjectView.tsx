import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent, CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { ImageObject } from '../../../model/objects/ImageObject';
import { ResizeView } from './ResizeView';

interface Props {
    image: ImageObject;
    selected: boolean;
    onSelect: () => void;
    onObjectChange: (newValue: ImageObject) => void;
}

export const ImageObjectViewBehavior: CustomPIXIComponentBehaviorDefinition<PIXI.Sprite, ImageObject> = {
    customDisplayObject(object: ImageObject) {
        const base = new PIXI.Sprite();

        base.x = 0;
        base.y = 0;
        base.width = object.width;
        base.height = object.height;
        base.texture = PIXI.Texture.from(object.srcFilePath);

        return base;
    },
    customApplyProps(base: PIXI.Sprite, oldObject: ImageObject, newObject: ImageObject) {
        if (oldObject.srcFilePath !== newObject.srcFilePath) {
            base.texture = PIXI.Texture.from(newObject.srcFilePath);
        }
    },
};

const ImageObjectView = CustomPIXIComponent(ImageObjectViewBehavior, 'ImageObjectView');

function ImageObjectViewWrapper(props: Props): React.ReactElement {
    const { image, selected, onSelect, onObjectChange } = props;

    return (
        <ResizeView object={image} onObjectChange={onObjectChange} onSelect={onSelect} selected={selected}>
            <ImageObjectView {...image} />
        </ResizeView>
    );
}

export { ImageObjectViewWrapper as ImageObjectView };
