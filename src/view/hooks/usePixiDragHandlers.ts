import * as PIXI from 'pixi.js';
import { useMemo, useState } from 'react';
import { useCallbackRef } from './useCallbackRef';

export interface PixiDragHandlers {
    onDragStart: (ev: PIXI.InteractionEvent) => void;
    onDragMove: (ev: PIXI.InteractionEvent) => void;
    onDragEnd: (ev: PIXI.InteractionEvent) => void;
}

export function attachPixiDragHandlers(displayObject: PIXI.DisplayObject, handlers: PixiDragHandlers): void {
    displayObject.on('mousedown', handlers.onDragStart);
    displayObject.on('mousemove', handlers.onDragMove);
    displayObject.on('mouseup', handlers.onDragEnd);
    displayObject.on('mouseupoutside', handlers.onDragEnd);
}

export function detachPixiDragHandlers(displayObject: PIXI.DisplayObject, handlers: PixiDragHandlers): void {
    displayObject.off('mousedown', handlers.onDragStart);
    displayObject.off('mousemove', handlers.onDragMove);
    displayObject.off('mouseup', handlers.onDragEnd);
    displayObject.off('mouseupoutside', handlers.onDragEnd);
}

export function usePixiDragHandlers(
    callback: (dx: number, dy: number, type: 'start' | 'move' | 'end', ev: PIXI.InteractionEvent) => void
): PixiDragHandlers {
    const [dragStartPoint, setDragStartPoint] = useState<PIXI.IPointData | null>(null);

    const onDragStart = useCallbackRef((ev: PIXI.InteractionEvent) => {
        if (dragStartPoint !== null) return;

        setDragStartPoint({ ...ev.data.global });
        callback(0, 0, 'start', ev);
    });

    const onDragMove = useCallbackRef((ev: PIXI.InteractionEvent) => {
        if (dragStartPoint === null) return;

        const dx = ev.data.global.x - dragStartPoint.x;
        const dy = ev.data.global.y - dragStartPoint.y;
        callback(dx, dy, 'move', ev);
    });

    const onDragEnd = useCallbackRef((ev: PIXI.InteractionEvent) => {
        if (dragStartPoint === null) return;

        const dx = ev.data.global.x - dragStartPoint.x;
        const dy = ev.data.global.y - dragStartPoint.y;
        setDragStartPoint(null);
        callback(dx, dy, 'end', ev);
    });

    return useMemo(() => ({ onDragStart, onDragMove, onDragEnd }), [onDragEnd, onDragMove, onDragStart]);
}
