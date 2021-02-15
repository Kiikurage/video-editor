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
    onSelect: () => void;
    onObjectChange: (oldObject: ImageObject, x: number, y: number, width: number, height: number) => void;
}

interface PixiProps {
    srcFilePath: string;
    width: number;
    height: number;
}

function applyProps(base: PIXI.Sprite, props: PixiProps) {
    const { width, height } = props;

    base.x = 0;
    base.y = 0;
    base.width = width;
    base.height = height;
}

export const ImageObjectViewBehavior: CustomPIXIComponentBehaviorDefinition<PIXI.Sprite, PixiProps> = {
    customDisplayObject(props: PixiProps) {
        const base = new PIXI.Sprite();

        applyProps(base, props);
        base.texture = PIXI.Texture.from(props.srcFilePath);

        return base;
    },
    customApplyProps(base: PIXI.Sprite, oldProps: PixiProps, newProps: PixiProps) {
        applyProps(base, newProps);

        if (oldProps.srcFilePath !== newProps.srcFilePath) {
            base.texture = PIXI.Texture.from(newProps.srcFilePath);
        }
    },
};

const ImageObjectView = CustomPIXIComponent(ImageObjectViewBehavior, 'ImageObjectView');

function ImageObjectViewWrapper(props: Props): React.ReactElement {
    const { image, previewController, selected, snapPositionXs, snapPositionYs, onSelect, onObjectChange } = props;

    const onChange = useCallbackRef((x: number, y: number, width: number, height: number) => {
        onObjectChange(image, x, y, width, height);
    });

    const x = AnimatableValue.interpolate(image.x, image.startInMS, image.endInMS, previewController.currentTimeInMS);
    const y = AnimatableValue.interpolate(image.y, image.startInMS, image.endInMS, previewController.currentTimeInMS);
    const width = AnimatableValue.interpolate(image.width, image.startInMS, image.endInMS, previewController.currentTimeInMS);
    const height = AnimatableValue.interpolate(image.height, image.startInMS, image.endInMS, previewController.currentTimeInMS);

    return (
        <ResizeView
            x={x}
            y={y}
            width={width}
            height={height}
            locked={image.locked}
            snapPositionXs={snapPositionXs}
            snapPositionYs={snapPositionYs}
            onChange={onChange}
            onSelect={onSelect}
            selected={selected}
        >
            <ImageObjectView srcFilePath={image.srcFilePath} width={width} height={height} />
        </ResizeView>
    );
}

export { ImageObjectViewWrapper as ImageObjectView };
