import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { CaptionObject } from '../../../model/CaptionObject';

interface Props {
    caption: CaptionObject;
}

interface InnerProps {
    text: string;
    x: number;
    y: number;
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
            base.anchor.x = 0.5;
            base.anchor.y = 1;

            return base;
        },
        customApplyProps(base: PIXI.Text, oldProps: InnerProps, newProps: InnerProps): void {
            const { text, x, y } = newProps;

            base.text = text;
            base.x = x;
            base.y = y;
        },
    },
    'CaptionObjectView'
);

function CaptionObjectViewWrapper(props: Props): React.ReactElement {
    const { caption } = props;

    return <CaptionObjectView text={caption.text} x={caption.x} y={caption.y} />;
}

export { CaptionObjectViewWrapper as CaptionObjectView };
