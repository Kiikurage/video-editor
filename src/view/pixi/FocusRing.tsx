import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';

interface Props {
    isSelected: boolean;
    width: number;
    height: number;
}

interface InnerProps {
    isSelected: boolean;
    width: number;
    height: number;
}

const FocusRing = CustomPIXIComponent(
    {
        customDisplayObject() {
            return new PIXI.Graphics();
        },
        customApplyProps(base: PIXI.Graphics, oldProps: InnerProps, newProps: InnerProps): void {
            const { isSelected, width, height } = newProps;

            const lineWidth = isSelected ? 2 : 1;
            base.clear();
            base.lineStyle(lineWidth, 0x3465b5, 1);
            base.beginFill(0xffffff, 0);
            base.drawRoundedRect(0, 0, width, height, 4);
            base.endFill();
        },
    },
    'FocusRing'
);

function FocusRingWrapper(props: Props): React.ReactElement {
    const { isSelected, width, height } = props;

    return <FocusRing isSelected={isSelected} width={width} height={height} />;
}

export { FocusRingWrapper as FocusRing };
