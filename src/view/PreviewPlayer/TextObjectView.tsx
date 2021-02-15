import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
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
    onSelect: () => void;
    onObjectChange: (oldObject: TextObject, x: number, y: number, width: number, height: number) => void;
}

interface PixiProps {
    object: TextObject;
    width: number;
    height: number;
}

function applyProps(base: PIXI.Text, props: PixiProps) {
    const { object, width, height } = props;

    base.x = 0;
    base.y = 0;
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

export const TextObjectViewBehavior = {
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

    const onClick = useCallbackRef(() => {
        onSelect();
    });

    const onChange = useCallbackRef((x: number, y: number, width: number, height: number) => {
        onObjectChange(textObject, x, y, width, height);
    });

    const x = AnimatableValue.interpolate(textObject.x, textObject.startInMS, textObject.endInMS, previewController.currentTimeInMS);
    const y = AnimatableValue.interpolate(textObject.y, textObject.startInMS, textObject.endInMS, previewController.currentTimeInMS);
    const width = AnimatableValue.interpolate(
        textObject.width,
        textObject.startInMS,
        textObject.endInMS,
        previewController.currentTimeInMS
    );
    const height = AnimatableValue.interpolate(
        textObject.height,
        textObject.startInMS,
        textObject.endInMS,
        previewController.currentTimeInMS
    );

    return (
        <ResizeView
            x={x}
            y={y}
            width={width}
            height={height}
            locked={textObject.locked}
            snapPositionXs={snapPositionXs}
            snapPositionYs={snapPositionYs}
            onChange={onChange}
            onSelect={onClick}
            selected={selected}
        >
            <TextObjectView object={textObject} width={width} height={height} />
        </ResizeView>
    );
}

export { TextObjectViewWrapper as TextObjectView };
