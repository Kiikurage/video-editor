import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent, CustomPIXIComponentBehaviorDefinition } from 'react-pixi-fiber';
import { AnimatableValue } from '../../model/objects/AnimatableValue';
import { TextObject } from '../../model/objects/TextObject';
import { PreviewController } from '../../service/PreviewController';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { ResizeView } from './ResizeView/ResizeView';

interface Props {
    textObject: TextObject;
    previewController: PreviewController;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onSelect: (ev: PIXI.InteractionEvent) => void;
    onObjectChange: (oldObject: TextObject, x: number, y: number, width: number, height: number) => void;
}

interface PixiProps {
    object: TextObject;
    timeInMS: number;
}

function applyProps(base: PIXI.Text, props: PixiProps) {
    const { object, timeInMS } = props;
    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, timeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, timeInMS);
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, timeInMS);

    base.x = x;
    base.y = y;
    base.width = width;
    base.height = height;
    base.text = object.text;

    const textStyle = base.style as PIXI.TextStyle;
    textStyle.fontFamily = object.fontStyle.fontFamily;
    textStyle.fontSize = object.fontStyle.fontSize;
    textStyle.fontWeight = object.fontStyle.fontWeight;
    textStyle.fill = object.fontStyle.fill;
    textStyle.stroke = object.fontStyle.stroke;
    textStyle.strokeThickness = object.fontStyle.strokeThickness;

    return base;
}

export const TextObjectViewBehavior: CustomPIXIComponentBehaviorDefinition<PIXI.Text, PixiProps> = {
    customDisplayObject(props: PixiProps): PIXI.Text {
        const base = new PIXI.Text('');

        applyProps(base, props);

        return base;
    },
    customApplyProps(base: PIXI.Text, oldProps: PixiProps, newProps: PixiProps): void {
        applyProps(base, newProps);
    },
};

const TextObjectView = CustomPIXIComponent(TextObjectViewBehavior, 'TextObjectView');

function TextObjectViewWrapper(props: Props): React.ReactElement {
    const { textObject, previewController, selected, snapPositionXs, snapPositionYs, onSelect, onObjectChange } = props;

    const onChange = useCallbackRef((x: number, y: number, width: number, height: number) => {
        onObjectChange(textObject, x, y, width, height);
    });

    return (
        <>
            <TextObjectView object={textObject} timeInMS={previewController.currentTimeInMS} />
            <ResizeView
                object={textObject}
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

export { TextObjectViewWrapper as TextObjectView };
