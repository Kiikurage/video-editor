import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { snap } from '../../lib/snap';
import { BaseObject } from '../../model/objects/BaseObject';
import { useCallbackRef } from '../hooks/useCallbackRef';
import { attachPixiDragHandlers, detachPixiDragHandlers, PixiDragHandlers, usePixiDragHandlers } from '../hooks/usePixiDragHandlers';
import { ChildrenContainer } from './ChildrenContainer';
import { FocusRing } from './FocusRing';

interface Props<T extends BaseObject = BaseObject> {
    object: T;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    isSelected: boolean;
    snapPositionXs: number[];
    keyframeTimings: number[];
    onKeyframeClick: (ev: PIXI.InteractionEvent, object: T, timing: number) => void;
    onClick: (ev: PIXI.InteractionEvent, object: T) => void;
    onChange: (object: T, newX: number, newWidth: number) => void;
}

export const TimelineNodeResizeContext = React.createContext<{ width: number; height: number }>({
    width: 1,
    height: 1,
});

export function useTimelineObjectViewSize(): { width: number; height: number } {
    return useContext(TimelineNodeResizeContext);
}

interface PixiProps {
    x: number;
    y: number;
    width: number;
    height: number;
    locked: boolean;
    onClick: (ev: PIXI.InteractionEvent) => void;
    backgroundDragHandlers: PixiDragHandlers;
    wResizerDragHandlers: PixiDragHandlers;
    eResizerDragHandlers: PixiDragHandlers;
}

function applyProps(base: PIXI.Container, props: PixiProps) {
    const { x, y, width, height, locked } = props;

    base.x = x;
    base.y = y;
    base.width = width;
    base.height = height;
    base.scale.x = 1;
    base.scale.y = 1;

    const background = base.getChildByName('background') as PIXI.Graphics;
    background.interactive = true;
    background.buttonMode = true;
    background.cursor = locked ? 'default' : 'move';
    background.clear();
    background.beginFill(0xf0f0f0, 1);
    background.drawRect(0, 0, width, height);
    background.endFill();

    const eResizer = base.getChildByName('eResizer') as PIXI.Sprite;
    eResizer.interactive = true;
    eResizer.buttonMode = true;
    eResizer.x = width - 8;
    eResizer.y = 0;
    eResizer.width = 8;
    eResizer.height = height;
    eResizer.cursor = locked ? 'default' : 'ew-resize';

    const wResizer = base.getChildByName('wResizer') as PIXI.Sprite;
    wResizer.interactive = true;
    wResizer.buttonMode = true;
    wResizer.x = 0;
    wResizer.y = 0;
    wResizer.width = 8;
    wResizer.height = height;
    wResizer.cursor = locked ? 'default' : 'ew-resize';
}

const TimelineNodeBase = CustomPIXIComponent<PIXI.Container, PixiProps>(
    {
        customDisplayObject(props: PixiProps) {
            const base = new PIXI.Container();

            const background = new PIXI.Graphics();
            background.name = 'background';
            base.addChild(background);

            const eResizer = new PIXI.Sprite();
            eResizer.name = 'eResizer';
            base.addChild(eResizer);

            const wResizer = new PIXI.Sprite();
            wResizer.name = 'wResizer';
            base.addChild(wResizer);

            applyProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Container, oldProps: PixiProps, newProps: PixiProps): void {
            applyProps(base, newProps);

            const background = base.getChildByName('background') as PIXI.Graphics;
            if (oldProps.onClick) background.off('mousedown', oldProps.onClick);
            if (newProps.onClick) background.on('mousedown', newProps.onClick);
            if (oldProps.backgroundDragHandlers) detachPixiDragHandlers(background, oldProps.backgroundDragHandlers);
            if (newProps.backgroundDragHandlers) attachPixiDragHandlers(background, newProps.backgroundDragHandlers);

            const eResizer = base.getChildByName('eResizer') as PIXI.Graphics;
            if (oldProps.eResizerDragHandlers) detachPixiDragHandlers(eResizer, oldProps.eResizerDragHandlers);
            if (newProps.eResizerDragHandlers) attachPixiDragHandlers(eResizer, newProps.eResizerDragHandlers);

            const wResizer = base.getChildByName('wResizer') as PIXI.Graphics;
            if (oldProps.wResizerDragHandlers) detachPixiDragHandlers(wResizer, oldProps.wResizerDragHandlers);
            if (newProps.wResizerDragHandlers) attachPixiDragHandlers(wResizer, newProps.wResizerDragHandlers);
        },
    },
    'TimelineNodeBase'
);

interface PixiFrontLayerProps {
    x: number;
    width: number;
    height: number;
    text: string;
    isSelected: boolean;
}

function applyFrontLayerProps(base: PIXI.Graphics, props: PixiFrontLayerProps) {
    const { x, width, height, text, isSelected } = props;

    const textNode = base.getChildByName('text') as PIXI.Text;
    textNode.x = 6;
    textNode.y = 3;
    textNode.text = text;
    textNode.anchor.x = 0;
    textNode.anchor.y = 0;
    textNode.scale.x = 1;
    textNode.scale.y = 1;
    textNode.style = {
        fill: 0xffffff,
        fontSize: 12,
        fontWeight: 'normal',
    };

    const baseWidth = Math.min(textNode.width + 12, width);
    const baseHeight = textNode.height + 6;
    base.x = Math.min(Math.max(0, -x), width - baseWidth);
    base.y = 0;
    base.width = baseWidth;
    base.height = baseHeight;
    base.scale.x = 1;
    base.scale.y = 1;
    base.clear();
    base.beginFill(isSelected ? 0x4d90fe : 0x808080, 1);
    base.drawRect(0, 0, baseWidth, baseHeight);
    base.endFill();

    const mask = textNode.mask as PIXI.Graphics;
    mask.clear();
    mask.beginFill(0xffffff, 1);
    mask.drawRect(0, 0, width, height);
    mask.endFill();
}

const TimelineNodeBaseFrontLayer = CustomPIXIComponent<PIXI.Graphics, PixiFrontLayerProps>(
    {
        customDisplayObject(props: PixiFrontLayerProps) {
            const base = new PIXI.Graphics();

            const text = new PIXI.Text('');
            text.name = 'text';
            text.mask = new PIXI.Graphics();
            base.addChild(text, text.mask);

            applyFrontLayerProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiFrontLayerProps, newProps: PixiFrontLayerProps): void {
            applyFrontLayerProps(base, newProps);
        },
    },
    'TimelineNodeBaseFrontLayer'
);

interface PixiKeyframeIndicatorProps {
    y: number;
    keyframeTimings: number[];
    width: number;
    onKeyframeClick: (ev: PIXI.InteractionEvent, timing: number) => void;
}

function applyKeyframeIndicatorProps(base: PIXI.Graphics, props: PixiKeyframeIndicatorProps) {
    const { y, width, keyframeTimings, onKeyframeClick } = props;

    base.x = 0;
    base.y = y;
    base.width = width;
    base.height = 16;
    base.scale.x = 1;
    base.scale.y = 1;

    base.clear();

    base.lineStyle(0, 0x000000, 0);
    base.beginFill(0x000000, 0.1);
    base.drawRect(0, 0, width, 16);
    base.endFill();

    while (base.children.length < keyframeTimings.length) {
        const keyframeGraphics = new PIXI.Graphics();
        keyframeGraphics.mask = new PIXI.Graphics();
        keyframeGraphics.interactive = true;
        keyframeGraphics.buttonMode = true;
        keyframeGraphics.addChild(keyframeGraphics.mask);
        base.addChild(keyframeGraphics);
    }
    if (base.children.length > keyframeTimings.length) {
        base.removeChildren(keyframeTimings.length);
    }

    for (let i = 0; i < keyframeTimings.length; i++) {
        const keyframeGraphics = base.children[i] as PIXI.Graphics;
        const keyframeTiming = keyframeTimings[i];

        keyframeGraphics.x = width * keyframeTiming - 8;
        keyframeGraphics.y = 0;
        keyframeGraphics.width = 16;
        keyframeGraphics.height = 16;
        keyframeGraphics.clear();
        keyframeGraphics.beginFill(0x808080, 1);
        keyframeGraphics.drawPolygon([2, 8, 8, 2, 14, 8, 8, 14]);
        keyframeGraphics.endFill();
        keyframeGraphics.scale.x = 1;
        keyframeGraphics.scale.y = 1;
        keyframeGraphics.removeAllListeners('click');
        keyframeGraphics.on('click', (ev: PIXI.InteractionEvent) => onKeyframeClick(ev, keyframeTiming));

        const mask = keyframeGraphics.mask as PIXI.Graphics;
        mask.clear();
        mask.beginFill(0xfff, 1);
        mask.drawPolygon([0, 8, 8, 0, 16, 8, 8, 16]);
        mask.scale.x = 1;
        mask.scale.y = 1;
    }
}

const TimelineNodeBaseKeyframeIndicator = CustomPIXIComponent<PIXI.Graphics, PixiKeyframeIndicatorProps>(
    {
        customDisplayObject(props: PixiKeyframeIndicatorProps) {
            const base = new PIXI.Graphics();

            applyKeyframeIndicatorProps(base, props);

            return base;
        },
        customApplyProps(base: PIXI.Graphics, oldProps: PixiKeyframeIndicatorProps, newProps: PixiKeyframeIndicatorProps): void {
            applyKeyframeIndicatorProps(base, newProps);
        },
    },
    'TimelineNodeBaseKeyframeIndicator'
);

function TimelineNodeBaseWrapper<T extends BaseObject>(props: React.PropsWithChildren<Props<T>>): React.ReactElement {
    const { object, x, y, width, height, text, isSelected, snapPositionXs, keyframeTimings, onChange, children } = props;

    const [{ dx1, dx2 }, setDx] = useState({ dx1: 0, dx2: 0 });
    useEffect(() => {
        setDx({ dx1: 0, dx2: 0 });
    }, [object]);

    const backgroundDragHandlers = usePixiDragHandlers((dx, _dy, type) => {
        if (object.locked) return;

        const newX1 = x + dx;
        const newX2 = x + width + dx;
        const snappedNewX1 = snap(newX1, snapPositionXs);
        const snappedNewX2 = snap(newX2, snapPositionXs);

        if (snappedNewX1 !== newX1) {
            dx = snappedNewX1 - x;
        } else if (snappedNewX2 !== newX2) {
            dx = snappedNewX2 - (x + width);
        }

        if (type === 'end' && dx !== 0) {
            onChange(object, x + dx, width);
        } else {
            setDx({ dx1: dx, dx2: dx });
        }
    });

    const wResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        if (object.locked) return;
        ev.stopPropagation();

        dx = snap(x + dx, snapPositionXs) - x;

        if (type === 'end' && dx !== 0) {
            onChange(object, x + dx, width - dx);
        } else {
            setDx({ dx1: dx, dx2: 0 });
        }
    });

    const eResizerDragHandlers = usePixiDragHandlers((dx, _dy, type, ev) => {
        if (object.locked) return;
        ev.stopPropagation();

        dx = snap(x + width + dx, snapPositionXs) - (x + width);

        if (type === 'end' && dx !== 0) {
            onChange(object, x, width + dx);
        } else {
            setDx({ dx1: 0, dx2: dx });
        }
    });

    const onClick = useCallbackRef((ev: PIXI.InteractionEvent) => {
        props.onClick(ev, object);
    });
    const onKeyframeClick = useCallbackRef((ev: PIXI.InteractionEvent, timing: number) => {
        props.onKeyframeClick(ev, object, timing);
    });
    return (
        <TimelineNodeBase
            x={x + dx1}
            y={y}
            width={width + dx2 - dx1}
            height={height}
            onClick={onClick}
            locked={object.locked}
            backgroundDragHandlers={backgroundDragHandlers}
            wResizerDragHandlers={wResizerDragHandlers}
            eResizerDragHandlers={eResizerDragHandlers}
        >
            <ChildrenContainer x={0} y={0} width={width + dx2 - dx1} height={height - 16}>
                <TimelineNodeResizeContext.Provider
                    value={{
                        width: width + dx2 - dx1,
                        height: height - 16,
                    }}
                >
                    {children}
                </TimelineNodeResizeContext.Provider>
            </ChildrenContainer>
            <TimelineNodeBaseFrontLayer x={x + dx1} y={y} width={width + dx2 - dx1} height={height} text={text} isSelected={isSelected} />
            <FocusRing isSelected={isSelected} width={width + dx2 - dx1} height={height} />
            <TimelineNodeBaseKeyframeIndicator
                y={height - 16}
                width={width + dx2 - dx1}
                keyframeTimings={keyframeTimings}
                onKeyframeClick={onKeyframeClick}
            />
        </TimelineNodeBase>
    );
}

export { TimelineNodeBaseWrapper as TimelineNodeBase };
