import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { CaptionObject } from '../../../model/objects/CaptionObject';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import { ResizeView } from './ResizeView';

interface Props {
    caption: CaptionObject;
    selected: boolean;
    onSelect: () => void;
    onObjectChange: (oldValue: CaptionObject, newValue: CaptionObject) => void;
}

export const CaptionObjectViewBehavior = {
    customDisplayObject(object: CaptionObject): PIXI.Text {
        const base = new PIXI.Text('');
        base.x = 0;
        base.y = 0;
        base.width = object.width;
        base.height = object.height;
        base.text = object.text;

        const textStyle = base.style as PIXI.TextStyle;
        textStyle.fontFamily = 'Noto Sans JP';
        textStyle.fontSize = 80;
        textStyle.fontWeight = 'bold';
        textStyle.fill = 0xaa66ff;
        textStyle.stroke = 0xffffff;
        textStyle.strokeThickness = 10;

        return base;
    },
    customApplyProps(base: PIXI.Text, oldObject: CaptionObject, newObject: CaptionObject): void {
        base.width = newObject.width;
        base.height = newObject.height;
        base.text = newObject.text;
    },
};

const CaptionObjectView = CustomPIXIComponent(CaptionObjectViewBehavior, 'CaptionObjectView');

function CaptionObjectViewWrapper(props: Props): React.ReactElement {
    const { caption, selected, onSelect, onObjectChange } = props;

    const onClick = useCallbackRef(() => {
        onSelect();
    });

    return (
        <ResizeView object={caption} onObjectChange={onObjectChange} onSelect={onClick} selected={selected}>
            <CaptionObjectView {...caption} />
        </ResizeView>
    );
}

export { CaptionObjectViewWrapper as CaptionObjectView };
