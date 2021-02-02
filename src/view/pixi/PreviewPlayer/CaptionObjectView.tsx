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

interface InnerProps {
    text: string;
    width: number;
    height: number;
}

const CaptionObjectView = CustomPIXIComponent(
    {
        customDisplayObject() {
            const base = new PIXI.Text('', {
                fontFamily: '"Noto Sans JP"',
                fontSize: 80,
                fontWeight: 900,
                fill: 0xaa66ff,
                stroke: 0xffffff,
                strokeThickness: 10,
            });
            base.anchor.x = 0;
            base.anchor.y = 0;

            return base;
        },
        customApplyProps(base: PIXI.Text, oldProps: InnerProps, newProps: InnerProps): void {
            const { text, width, height } = newProps;

            base.text = text;
            base.x = 0;
            base.y = 0;
            base.width = width;
            base.height = height;
        },
    },
    'CaptionObjectView'
);

function CaptionObjectViewWrapper(props: Props): React.ReactElement {
    const { caption, selected, onSelect, onObjectChange } = props;

    const onClick = useCallbackRef(() => {
        onSelect();
    });

    return (
        <ResizeView object={caption} onObjectChange={onObjectChange} onSelect={onClick} selected={selected}>
            <CaptionObjectView text={caption.text} width={caption.width} height={caption.height} />
        </ResizeView>
    );
}

export { CaptionObjectViewWrapper as CaptionObjectView };
