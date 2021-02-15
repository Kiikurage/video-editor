import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent, CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { ImageObject } from '../../model/objects/ImageObject';
import { PreviewController } from '../../service/PreviewController';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { ResizeView } from './ResizeView/ResizeView';

interface Props {
    image: ImageObject;
    previewController: PreviewController;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onSelect: (ev: PIXI.InteractionEvent) => void;
    onObjectChange: (oldObject: ImageObject, x: number, y: number, width: number, height: number) => void;
}

interface PixiProps {
    object: ImageObject;
    timeInMS: number;
}

function applyProps(base: PIXI.Sprite, props: PixiProps) {
    const { object, timeInMS } = props;
    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, timeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, timeInMS);
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);

    base.x = x;
    base.y = y;
    base.width = width;
    base.height = height;
}

export const ImageObjectViewBehavior: CustomPIXIComponentBehaviorDefinition<PIXI.Sprite, PixiProps> = {
    customDisplayObject(props: PixiProps) {
        const base = new PIXI.Sprite();

        applyProps(base, props);
        base.texture = PIXI.Texture.from(props.object.srcFilePath);

        return base;
    },
    customApplyProps(base: PIXI.Sprite, oldProps: PixiProps, newProps: PixiProps) {
        applyProps(base, newProps);

        if (oldProps.object?.srcFilePath !== newProps.object.srcFilePath) {
            base.texture = PIXI.Texture.from(newProps.object.srcFilePath);
        }
    },
};

const ImageObjectView = CustomPIXIComponent(ImageObjectViewBehavior, 'ImageObjectView');

function ImageObjectViewWrapper(props: Props): React.ReactElement {
    const { image, previewController, selected, snapPositionXs, snapPositionYs, onSelect, onObjectChange } = props;

    const onChange = useCallbackRef((x: number, y: number, width: number, height: number) => {
        onObjectChange(image, x, y, width, height);
    });

    return (
        <>
            <ImageObjectView object={image} timeInMS={previewController.currentTimeInMS} />
            <ResizeView
                object={image}
                previewController={previewController}
                snapPositionXs={snapPositionXs}
                snapPositionYs={snapPositionYs}
                onChange={onChange}
                onSelect={onSelect}
                selected={selected}
            />
        </>
    );
}

export { ImageObjectViewWrapper as ImageObjectView };
