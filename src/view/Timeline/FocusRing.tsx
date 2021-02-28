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

            base.clear();
            base.lineStyle(isSelected ? 2 : 1, isSelected ? 0x4d90fe : 0x808080, 1);
            base.beginFill(0xffffff, 0);
            base.drawRect(0, 0, width, height);
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
