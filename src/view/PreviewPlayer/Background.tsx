import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { useCallbackRef } from '../hooks/useCallbackRef';

interface Props {
    width: number;
    height: number;
    onClick: () => void;
}

interface PixiProps {
    width: number;
    height: number;
    onClick: (ev: PIXI.InteractionEvent) => void;
}

function applyProps(base: PIXI.Graphics, props: PixiProps) {
    const { width, height } = props;

    base.interactive = true;
    base.buttonMode = true;
    base.x = 0;
    base.y = 0;
    base.width = width;
    base.height = height;

    base.clear();
    base.beginFill(0x000000, 1);
    base.drawRect(0, 0, width, height);
    base.endFill();
}

const Background = CustomPIXIComponent(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Graphics();

            applyProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiProps, newProps: PixiProps): void {
            base.off('mousedown', oldProps.onClick);
            base.on('mousedown', newProps.onClick);
        },
    },
    'Background'
);

function BackgroundWrapper(props: Props): React.ReactElement {
    const { width, height } = props;

    const onClick = useCallbackRef((ev: PIXI.InteractionEvent) => {
        ev.stopPropagation();
        props.onClick();
    });

    return <Background width={width} height={height} onClick={onClick} />;
}

export { BackgroundWrapper as Background };
