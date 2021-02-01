import * as PIXI from 'pixi.js';
import * as React from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { useCallbackRef } from '../../hooks/useCallbackRef';

interface Props {
    width: number;
    height: number;
    onClick: () => void;
}

interface InnerProps {
    width: number;
    height: number;
    onClick: (ev: PIXI.InteractionEvent) => void;
}

const Background = CustomPIXIComponent(
    {
        customDisplayObject() {
            const base = new PIXI.Graphics();
            base.interactive = true;
            base.buttonMode = true;
            base.cursor = 'pointer';

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: InnerProps, newProps: InnerProps): void {
            const { width, height, onClick } = newProps;

            base.x = 0;
            base.y = 0;
            base.width = width;
            base.height = height;

            base.off('mousedown', oldProps.onClick);
            base.on('mousedown', onClick);

            base.clear();
            base.beginFill(0xffffff, 1);
            base.drawRect(0, 0, width, height);
            base.endFill();
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
