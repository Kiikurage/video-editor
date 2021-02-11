import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useRef } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { snap } from '../../../../lib/snap';
import { useFormState } from '../../../hooks/useFormState';
import { attachPixiDragHandlers, detachPixiDragHandlers, PixiDragHandlers, usePixiDragHandlers } from '../../../hooks/usePixiDragHandlers';
import { DIR, RESIZER_SIZE } from './constant';

interface Props {
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    locked: boolean;
    snapPositionXs: number[];
    snapPositionYs: number[];
    onSelect: () => void;
    onChange: (dx: number, dy: number, dw: number, dh: number) => void;
}

interface PixiProps {
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    locked: boolean;
    frameDragHandlers: PixiDragHandlers;
    resizerDragHandlers: Record<string, PixiDragHandlers>;
    onClick: () => void;
}

function applyProps(base: PIXI.Container, props: PixiProps) {
    const { x, y, width, height, selected, locked } = props;

    base.x = 0;
    base.y = 0;
    base.cursor = props.locked ? 'default' : 'move';
    base.interactive = true;
    base.buttonMode = true;
    base.cursor = locked ? 'default' : 'move';

    const frame = base.getChildByName('frame') as PIXI.Graphics;
    frame.interactive = !locked;
    frame.buttonMode = !locked;
    frame.clear();
    frame.lineStyle(4, 0x4d90fe, selected ? 1 : 0);
    frame.drawRect(x, y, width, height);
    frame.hitArea = new PIXI.Rectangle(x, y, width, height);

    for (const { name, cursor, dirX, dirY } of DIR) {
        const resizer = base.getChildByName(name) as PIXI.Graphics;
        resizer.x = x - RESIZER_SIZE / 2;
        resizer.y = y - RESIZER_SIZE / 2;
        resizer.visible = selected && !locked;
        resizer.interactive = true;
        resizer.buttonMode = true;
        resizer.clear();
        resizer.lineStyle(4, 0xffffff, 1);
        resizer.beginFill(0x4d90fe, 1);
        resizer.drawRect(
            dirX === -1 ? 0 : dirX === 1 ? width : width / 2,
            dirY === -1 ? 0 : dirY === 1 ? height : height / 2,
            RESIZER_SIZE,
            RESIZER_SIZE
        );
        resizer.endFill();
        resizer.cursor = cursor;
    }
}

const ResizeControlView = CustomPIXIComponent(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Container();

            const frame = new PIXI.Graphics();
            frame.name = 'frame';
            base.addChild(frame);

            for (const { name } of DIR) {
                const resizer = new PIXI.Graphics();
                resizer.name = name;
                base.addChild(resizer);
            }

            applyProps(base, props);
            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);

            if (oldProps.onClick) base.off('mousedown', oldProps.onClick);
            if (newProps.onClick) base.on('mousedown', newProps.onClick);

            const frame = base.getChildByName('frame') as PIXI.Graphics;
            if (oldProps.frameDragHandlers) detachPixiDragHandlers(frame, oldProps.frameDragHandlers);
            if (newProps.frameDragHandlers) attachPixiDragHandlers(frame, newProps.frameDragHandlers);

            for (const { name } of DIR) {
                const resizer = base.getChildByName(name) as PIXI.Graphics;
                if (oldProps.resizerDragHandlers?.[name]) detachPixiDragHandlers(resizer, oldProps.resizerDragHandlers[name]);
                if (newProps.resizerDragHandlers?.[name]) attachPixiDragHandlers(resizer, newProps.resizerDragHandlers[name]);
            }
        },
    },
    'ResizeControlView'
);

export function ResizeControlViewWrapper(props: Props): React.ReactElement {
    const {
        x: originalX,
        y: originalY,
        width: originalWidth,
        height: originalHeight,
        selected,
        locked,
        snapPositionXs,
        snapPositionYs,
        onChange,
        onSelect,
    } = props;

    const [x, setX] = useFormState(originalX);
    const [y, setY] = useFormState(originalY);
    const [width, setWidth] = useFormState(originalWidth);
    const [height, setHeight] = useFormState(originalHeight);

    const frameDragHandlers = usePixiDragHandlers((dx, dy, type) => {
        const newX1 = Math.round(originalX + dx);
        const newX2 = Math.round(originalX + originalWidth + dx);
        const newY1 = Math.round(originalY + dy);
        const newY2 = Math.round(originalY + originalHeight + dy);
        const snappedNewX1 = snap(newX1, snapPositionXs, 30);
        const snappedNewX2 = snap(newX2, snapPositionXs, 30);
        const snappedNewY1 = snap(newY1, snapPositionYs, 30);
        const snappedNewY2 = snap(newY2, snapPositionYs, 30);

        if (snappedNewX1 !== newX1) {
            dx = snappedNewX1 - originalX;
        } else if (snappedNewX2 !== newX2) {
            dx = snappedNewX2 - (originalX + originalWidth);
        }

        if (snappedNewY1 !== newY1) {
            dy = snappedNewY1 - originalY;
        } else if (snappedNewY2 !== newY2) {
            dy = snappedNewY2 - (originalY + originalHeight);
        }

        setX(originalX + dx);
        setY(originalY + dy);

        if (type === 'end') {
            onChange(dx, dy, 0, 0);
        }
    });

    const resizerDragHandlers = useRef<Record<string, PixiDragHandlers>>({});
    for (const { name, dirX, dirY } of DIR) {
        // TODO: Don't Use react-hook inside for-loop
        // eslint-disable-next-line react-hooks/rules-of-hooks
        resizerDragHandlers.current[name] = usePixiDragHandlers((dx, dy, type, ev) => {
            ev.stopPropagation();

            if (dirX !== 0 && dirY !== 0 && ev.data.originalEvent.shiftKey) {
                /**
                 * Resize with respect to the original aspect ratio
                 *
                 * - If either width or height can snap to other object, that width or height should be respected. Other side should be
                 *   calculated from that side and aspect ratio.
                 * - If neither cannot snap, respect the axis which is closer to the diagonal line moving corner should be aligned.
                 */
                const oldX = dirX === -1 ? originalX : originalX + originalWidth;
                const newX = oldX + dx;
                const newXAfterSnap = snap(newX, snapPositionXs, 30);

                const oldY = dirY === -1 ? originalY : originalY + originalHeight;
                const newY = oldY + dy;
                const newYAfterSnap = snap(newY, snapPositionYs, 30);

                // When -1, object is flipped by that axis
                const flipX = Math.sign(originalWidth + dx * dirX);
                const flipY = Math.sign(originalHeight + dy * dirY);

                const isXSnapped = newXAfterSnap !== newX;
                const isYSnapped = newYAfterSnap !== newY;
                const wBeforeSnap = Math.abs(originalWidth + dx * dirX);
                const hBeforeSnap = Math.abs(originalHeight + dy * dirY);

                if (isXSnapped || (!isYSnapped && wBeforeSnap * originalHeight > hBeforeSnap * originalWidth)) {
                    // Respect X
                    dx = newXAfterSnap - oldX;
                    const h = Math.abs(originalHeight + (dx * dirX * originalHeight) / originalWidth);
                    dy = (h * flipY - originalHeight) * dirY;
                } else {
                    // Respect Y
                    dy = newYAfterSnap - oldY;
                    const w = Math.abs(originalWidth + (dy * dirY * originalWidth) / originalHeight);
                    dx = (w * flipX - originalWidth) * dirX;
                }
            }

            const x1 = Math.round(dirX === -1 ? snap(originalX + dx, snapPositionXs, 30) : originalX);
            const x2 = Math.round(dirX === 1 ? snap(originalX + originalWidth + dx, snapPositionXs, 30) : originalX + originalWidth);
            const y1 = Math.round(dirY === -1 ? snap(originalY + dy, snapPositionYs, 30) : originalY);
            const y2 = Math.round(dirY === 1 ? snap(originalY + originalHeight + dy, snapPositionYs, 30) : originalY + originalHeight);
            const w = Math.abs(x2 - x1);
            const h = Math.abs(y2 - y1);

            setX(Math.min(x1, x2));
            setY(Math.min(y1, y2));
            setWidth(w);
            setHeight(h);

            if (type === 'end') {
                onChange(Math.min(x1, x2) - originalX, Math.min(y1, y2) - originalY, w - originalWidth, h - originalHeight);
            }
        });
    }

    return (
        <ResizeControlView
            x={x}
            y={y}
            width={width}
            height={height}
            selected={selected}
            locked={locked}
            frameDragHandlers={frameDragHandlers}
            resizerDragHandlers={resizerDragHandlers.current}
            onClick={onSelect}
        />
    );
}

export { ResizeControlViewWrapper as ResizeControlView };
