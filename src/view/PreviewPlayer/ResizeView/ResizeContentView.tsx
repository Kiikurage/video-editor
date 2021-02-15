import * as PIXI from 'pixi.js';
import * as React from 'react';
import { PropsWithChildren } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';

interface Props {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface PixiProps {
    x: number;
    y: number;
    width: number;
    height: number;
}

function applyProps(base: PIXI.Container, props: PixiProps) {
    const { x, y, width, height } = props;

    base.x = x;
    base.y = y;
    base.width = width;
    base.height = height;
}

const ResizeContentView = CustomPIXIComponent(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Graphics();
            applyProps(base, props);
            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);
        },
    },
    'ResizeContentView'
);

function ResizeContentViewWrapper(props: PropsWithChildren<Props>): React.ReactElement {
    const { x, y, width, height, children } = props;

    return (
        <ResizeContentView x={x} y={y} width={width} height={height}>
            {children}
        </ResizeContentView>
    );
}

export { ResizeContentViewWrapper as ResizeContentView };
