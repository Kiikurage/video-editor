import * as PIXI from 'pixi.js';
import * as React from 'react';
import { PropsWithChildren } from 'react';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import { ResizeContentView } from './ResizeContentView';
import { ResizeControlView } from './ResizeControlView';

interface Props {
    x: number;
    y: number;
    width: number;
    height: number;
    locked: boolean;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onChange: (x: number, y: number, width: number, height: number) => void;
    onSelect: (ev: PIXI.InteractionEvent) => void;
}

export function ResizeView(props: PropsWithChildren<Props>): React.ReactElement {
    const { x, y, width, height, locked, selected, children, onChange, onSelect, snapPositionYs, snapPositionXs } = props;

    const onResizeControlChange = useCallbackRef((dx: number, dy: number, dw: number, dh: number) => {
        onChange(x + Math.round(dx), y + Math.round(dy), width + Math.round(dw), height + Math.round(dh));
    });

    return (
        <>
            <ResizeContentView x={x} y={y} width={width} height={height}>
                {children}
            </ResizeContentView>
            <ResizeControlView
                x={x}
                y={y}
                width={width}
                height={height}
                selected={selected}
                locked={locked}
                snapPositionXs={snapPositionXs}
                snapPositionYs={snapPositionYs}
                onChange={onResizeControlChange}
                onSelect={onSelect}
            />
        </>
    );
}
