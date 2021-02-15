import * as React from 'react';
import { useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { noop } from '../lib/util';
import { useCallbackRef } from './hooks/useCallbackRef';
import { useForceUpdate } from './hooks/useForceUpdate';

const Base = styled.div<{ direction: 'row' | 'column' }>`
    display: flex;
    flex-direction: ${(props) => props.direction};
    align-items: stretch;
    justify-content: stretch;
`;

const SplitterInner = styled.div``;

const SplitterBase = styled.div<{ active: boolean }>`
    display: flex;
    align-items: stretch;
    justify-content: center;
    position: relative;
    z-index: 999999999;
    will-change: transform;

    &:hover {
        ${SplitterInner} {
            background: #606060;
        }
    }
`;

const VerticalSplitter = styled(SplitterBase)`
    flex-direction: row;
    width: 30px;
    margin: 0 -15px;
    cursor: col-resize;

    ${SplitterInner} {
        width: 2px;
        height: 100%;
    }
`;

const HorizontalSplitter = styled(SplitterBase)`
    flex-direction: column;
    height: 30px;
    margin: -15px 0;
    cursor: row-resize;

    ${SplitterInner} {
        height: 2px;
        width: 100%;
    }
`;

export interface Props {
    direction: 'row' | 'column';
}

const context = React.createContext<{
    direction: 'row' | 'column';
    onMouseDown: (ev: React.MouseEvent, onSplitterMouseUpCallback: (dx: number, dy: number) => void) => void;
    dx: number;
    dy: number;
}>(null as never);

export function SplitPane(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { children, direction } = props;
    const forceUpdate = useForceUpdate();
    const dragPositionRef = useRef({
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
    });
    const isActiveRef = useRef(false);
    const onSplitterMouseUpCallbackRef = useRef<(dx: number, dy: number) => void>(noop);

    const onMouseDown = useCallbackRef((ev: React.MouseEvent, onSplitterMouseUpCallback: (dx: number, dy: number) => void) => {
        if (isActiveRef.current) return;

        isActiveRef.current = true;
        dragPositionRef.current.startX = ev.pageX;
        dragPositionRef.current.startY = ev.pageY;
        dragPositionRef.current.currentX = ev.pageX;
        dragPositionRef.current.currentY = ev.pageY;
        onSplitterMouseUpCallbackRef.current = onSplitterMouseUpCallback;
    });

    const onMouseMove = useCallbackRef((ev: React.MouseEvent) => {
        if (!isActiveRef.current) return;

        ev.preventDefault();
        ev.stopPropagation();
        dragPositionRef.current.currentX = ev.pageX;
        dragPositionRef.current.currentY = ev.pageY;
        forceUpdate();
    });

    const onMouseUp = useCallbackRef(() => {
        if (!isActiveRef.current) return;

        isActiveRef.current = false;
        onSplitterMouseUpCallbackRef.current(
            dragPositionRef.current.currentX - dragPositionRef.current.startX,
            dragPositionRef.current.currentY - dragPositionRef.current.startY
        );
        onSplitterMouseUpCallbackRef.current = noop;
        dragPositionRef.current.startX = 0;
        dragPositionRef.current.startY = 0;
        dragPositionRef.current.currentX = 0;
        dragPositionRef.current.currentY = 0;
    });

    const onMouseLeave = useCallbackRef(() => {
        if (!isActiveRef.current) return;

        isActiveRef.current = false;
        onSplitterMouseUpCallbackRef.current(0, 0);
        onSplitterMouseUpCallbackRef.current = noop;
        dragPositionRef.current.startX = 0;
        dragPositionRef.current.startY = 0;
        dragPositionRef.current.currentX = 0;
        dragPositionRef.current.currentY = 0;
    });

    return (
        <Base direction={direction} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}>
            <context.Provider
                value={{
                    direction: direction,
                    onMouseDown: onMouseDown,
                    dx: dragPositionRef.current.currentX - dragPositionRef.current.startX,
                    dy: dragPositionRef.current.currentY - dragPositionRef.current.startY,
                }}
            >
                {children}
            </context.Provider>
        </Base>
    );
}

interface SplitterProps {
    onChange: (dx: number, dy: number) => void;
}

export function Splitter(props: React.PropsWithChildren<SplitterProps>): React.ReactElement {
    const { onChange } = props;
    const { direction, onMouseDown: onContainerMouseDown, dx, dy } = useContext(context);
    const [isActive, setActive] = useState(false);

    const SplitterClass = direction === 'column' ? HorizontalSplitter : VerticalSplitter;

    const onMouseDown = useCallbackRef((ev: React.MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        onContainerMouseDown(ev, onMouseUp);
        setActive(true);
    });

    const onMouseUp = useCallbackRef((dx, dy) => {
        onChange(dx, dy);
        setActive(false);
    });

    return (
        <SplitterClass
            active={isActive}
            style={{
                transform: isActive ? (direction === 'row' ? `translateX(${dx}px)` : `translateY(${dy}px)`) : 'none',
            }}
            onMouseDown={onMouseDown}
        >
            <SplitterInner />
        </SplitterClass>
    );
}
