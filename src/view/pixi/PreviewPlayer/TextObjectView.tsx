import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { TextObject } from '../../../model/objects/TextObject';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import { ResizeView } from './ResizeView/ResizeView';

interface Props {
    textObject: TextObject;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onSelect: () => void;
    onObjectChange: (oldObject: TextObject, newObject: TextObject) => void;
}

export const TextObjectViewBehavior = {
    customDisplayObject(object: TextObject): PIXI.Text {
        const base = new PIXI.Text('');
        base.x = 0;
        base.y = 0;
        base.width = object.width;
        base.height = object.height;
        base.text = object.text;

        const textStyle = base.style as PIXI.TextStyle;
        textStyle.fontFamily = object.fontStyle.fontFamily;
        textStyle.fontSize = object.fontStyle.fontSize;
        textStyle.fontWeight = object.fontStyle.fontWeight;
        textStyle.fill = object.fontStyle.fill;
        textStyle.stroke = object.fontStyle.stroke;
        textStyle.strokeThickness = object.fontStyle.strokeThickness;

        return base;
    },
    customApplyProps(base: PIXI.Text, oldObject: TextObject, newObject: TextObject): void {
        base.width = newObject.width;
        base.height = newObject.height;
        base.text = newObject.text;

        const textStyle = base.style as PIXI.TextStyle;
        textStyle.fontFamily = newObject.fontStyle.fontFamily;
        textStyle.fontSize = newObject.fontStyle.fontSize;
        textStyle.fontWeight = newObject.fontStyle.fontWeight;
        textStyle.fill = newObject.fontStyle.fill;
        textStyle.stroke = newObject.fontStyle.stroke;
        textStyle.strokeThickness = newObject.fontStyle.strokeThickness;
    },
};

const TextObjectView = CustomPIXIComponent(TextObjectViewBehavior, 'TextObjectView');

function TextObjectViewWrapper(props: Props): React.ReactElement {
    const { textObject, selected, snapPositionXs, snapPositionYs, onSelect, onObjectChange } = props;

    const onClick = useCallbackRef(() => {
        onSelect();
    });

    return (
        <ResizeView
            object={textObject}
            snapPositionXs={snapPositionXs}
            snapPositionYs={snapPositionYs}
            onObjectChange={onObjectChange}
            onSelect={onClick}
            selected={selected}
        >
            <TextObjectView {...textObject} />
        </ResizeView>
    );
}

export { TextObjectViewWrapper as TextObjectView };
