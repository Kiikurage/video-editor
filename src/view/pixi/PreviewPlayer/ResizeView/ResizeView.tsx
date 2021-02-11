import * as React from 'react';
import { PropsWithChildren } from 'react';
import { useCallbackRef } from '../../../hooks/useCallbackRef';
import { ResizableObject } from './ResizableObejct';
import { ResizeContentView } from './ResizeContentView';
import { ResizeControlView } from './ResizeControlView';

interface Props<T extends ResizableObject> {
    object: T;
    selected: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onObjectChange: (oldObject: T, newObject: T) => void;
    onSelect: () => void;
}

export function ResizeView<T extends ResizableObject>(props: PropsWithChildren<Props<T>>): React.ReactElement {
    const { object, selected, children, onObjectChange, onSelect, snapPositionYs, snapPositionXs } = props;

    const onResizeControlChange = useCallbackRef((dx: number, dy: number, dw: number, dh: number) => {
        onObjectChange(object, {
            ...object,
            x: object.x + Math.round(dx),
            y: object.y + Math.round(dy),
            width: object.width + Math.round(dw),
            height: object.height + Math.round(dh),
        });
    });

    return (
        <>
            <ResizeContentView x={object.x} y={object.y} width={object.width} height={object.height}>
                {children}
            </ResizeContentView>
            <ResizeControlView
                x={object.x}
                y={object.y}
                width={object.width}
                height={object.height}
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
