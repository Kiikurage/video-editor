import * as React from 'react';
import { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { noop } from '../lib/util';
import { useCallbackRef } from './hooks/useCallbackRef';

const Base = styled.div<{ direction: 'row' | 'column' }>`
    display: flex;
    flex-direction: ${(props) => props.direction};
    align-items: stretch;
    justify-content: stretch;
    pointer-events: all;
`;

const SplitterInner = styled.div``;

const SplitterBase = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: center;
    position: relative;
    z-index: 999999999;
    will-change: transform;
    pointer-events: all;
`;

const VerticalSplitter = styled(SplitterBase)`
    flex-direction: row;
    width: 20px;
    margin: 0 -10px;
    cursor: col-resize;

    ${SplitterInner} {
        width: 2px;
        height: 100%;
    }
`;

const HorizontalSplitter = styled(SplitterBase)`
    flex-direction: column;
    height: 20px;
    margin: -10px 0;
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
    onMouseDown: (ev: React.MouseEvent, onMouseMove: (dx: number, dy: number) => void) => void;
}>(null as never);

export function SplitPane(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { children, direction } = props;
    const dragPositionRef = useRef({
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
    });
    const isActiveRef = useRef(false);
    const onMouseMoveCallbackRef = useRef<(dx: number, dy: number) => void>(noop);

    const onMouseDown = useCallbackRef((ev: React.MouseEvent, onMouseMove: (dx: number, dy: number) => void) => {
        if (isActiveRef.current) return;
        isActiveRef.current = true;

        dragPositionRef.current.startX = ev.pageX;
        dragPositionRef.current.startY = ev.pageY;
        dragPositionRef.current.currentX = ev.pageX;
        dragPositionRef.current.currentY = ev.pageY;
        onMouseMoveCallbackRef.current = onMouseMove;
    });

    const onWindowMouseUp = useCallbackRef((ev: MouseEvent) => {
        if (!isActiveRef.current) return;
        isActiveRef.current = false;
        ev.preventDefault();
        ev.stopPropagation();

        dragPositionRef.current.startX = 0;
        dragPositionRef.current.startY = 0;
        dragPositionRef.current.currentX = 0;
        dragPositionRef.current.currentY = 0;
        onMouseMoveCallbackRef.current = noop;
    });
    const onWindowMouseMove = useCallbackRef((ev: MouseEvent) => {
        if (!isActiveRef.current) return;
        ev.preventDefault();
        ev.stopPropagation();

        onMouseMoveCallbackRef.current(ev.pageX - dragPositionRef.current.startX, ev.pageY - dragPositionRef.current.startY);
        dragPositionRef.current.startX = ev.pageX;
        dragPositionRef.current.startY = ev.pageY;
    });
    useEffect(() => {
        window.addEventListener('mouseup', onWindowMouseUp);
        window.addEventListener('mousemove', onWindowMouseMove);
        return () => {
            window.removeEventListener('mouseup', onWindowMouseUp);
            window.removeEventListener('mousemove', onWindowMouseMove);
        };
    }, [onWindowMouseMove, onWindowMouseUp]);

    return (
        <Base direction={direction}>
            <context.Provider value={{ direction: direction, onMouseDown: onMouseDown }}>{children}</context.Provider>
        </Base>
    );
}

interface SplitterProps {
    onChange: (dx: number, dy: number) => void;
}

export function Splitter(props: React.PropsWithChildren<SplitterProps>): React.ReactElement {
    const { onChange } = props;
    const { direction, onMouseDown: onContainerMouseDown } = useContext(context);

    const SplitterClass = direction === 'column' ? HorizontalSplitter : VerticalSplitter;

    const onMouseDown = useCallbackRef((ev: React.MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        onContainerMouseDown(ev, onChange);
    });

    return (
        <SplitterClass onMouseDown={onMouseDown}>
            <SplitterInner />
        </SplitterClass>
    );
}
