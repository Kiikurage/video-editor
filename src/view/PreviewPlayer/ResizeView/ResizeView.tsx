import * as PIXI from 'pixi.js';
import * as React from 'react';
import { PropsWithChildren } from 'react';
import { AnimatableValue } from '../../../model/objects/AnimatableValue';
import { PreviewController } from '../../../service/PreviewController';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import { ResizableObject } from './ResizableObejct';
import { ResizeContentView } from './ResizeContentView';
import { ResizeControlView } from './ResizeControlView';

interface Props {
    object: ResizableObject;
    previewController: PreviewController;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onChange: (x: number, y: number, width: number, height: number) => void;
    onSelect: (ev: PIXI.InteractionEvent) => void;
}

export function ResizeView(props: PropsWithChildren<Props>): React.ReactElement {
    const { object, previewController, selected, children, onChange, onSelect, snapPositionYs, snapPositionXs } = props;
    const x = AnimatableValue.interpolate(object.x, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    const y = AnimatableValue.interpolate(object.y, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    const width = AnimatableValue.interpolate(object.width, object.startInMS, object.endInMS, previewController.currentTimeInMS);
    const height = AnimatableValue.interpolate(object.height, object.startInMS, object.endInMS, previewController.currentTimeInMS);

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
                locked={object.locked}
                snapPositionXs={snapPositionXs}
                snapPositionYs={snapPositionYs}
                onChange={onResizeControlChange}
                onSelect={onSelect}
            />
        </>
    );
}
