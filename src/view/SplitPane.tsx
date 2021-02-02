import * as React from 'react';
import { useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { noop } from '../lib/util';
import { useCallbackRef } from './hooks/useCallbackRef';

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

    &:hover {
        ${SplitterInner} {
            background: #606060;
        }
    }
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
    diff: { dx: number; dy: number };
    onDragStart: (ev: React.DragEvent, onDropHandler: (dx: number, dy: number) => void) => void;
}>(null as never);

export function SplitPane(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { children, direction } = props;
    const dragStartXRef = useRef(-1);
    const dragStartYRef = useRef(-1);
    const [diff, setDiff] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
    const onDropHandlerRef = useRef<(dx: number, dy: number) => void>(noop);

    const onDragStart = useCallbackRef((ev: React.DragEvent, onDropHandler: (dx: number, dy: number) => void) => {
        dragStartXRef.current = ev.clientX;
        dragStartYRef.current = ev.clientY;
        onDropHandlerRef.current = onDropHandler;

        ev.stopPropagation();
    });

    const onDragOver = useCallbackRef((ev: React.DragEvent) => {
        ev.stopPropagation();
        ev.preventDefault();

        setDiff({ dx: ev.clientX - dragStartXRef.current, dy: ev.clientY - dragStartYRef.current });
    });

    const onDrop = useCallbackRef((ev: React.DragEvent) => {
        ev.stopPropagation();
        ev.preventDefault();

        setDiff({ dx: 0, dy: 0 });

        const dx = ev.clientX - dragStartXRef.current;
        const dy = ev.clientY - dragStartYRef.current;
        onDropHandlerRef.current(dx, dy);
    });

    return (
        <context.Provider
            value={{
                direction: direction,
                onDragStart: onDragStart,
                diff: diff,
            }}
        >
            <Base direction={direction} onDragOver={onDragOver} onDrop={onDrop}>
                {children}
            </Base>
        </context.Provider>
    );
}

interface SplitterProps {
    onChange: (dx: number, dy: number) => void;
}

const EMPTY_IMAGE = new Image();
EMPTY_IMAGE.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

export function Splitter(props: React.PropsWithChildren<SplitterProps>): React.ReactElement {
    const { onChange } = props;
    const {
        direction,
        diff: { dx, dy },
        onDragStart: splitPaneDragStartHandler,
    } = useContext(context);
    const [isActive, setActive] = useState(false);

    const SplitterClass = direction === 'column' ? HorizontalSplitter : VerticalSplitter;

    const onDragStart = useCallbackRef((ev: React.DragEvent) => {
        ev.dataTransfer.setDragImage(EMPTY_IMAGE, 0, 0);

        splitPaneDragStartHandler(ev, onChange);
        setActive(true);
    });

    const onDragEnd = useCallbackRef(() => {
        setActive(false);
    });

    return (
        <SplitterClass
            active={isActive}
            style={{
                transform: isActive ? (direction === 'row' ? `translateX(${dx}px)` : `translateY(${dy}px)`) : 'none',
            }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggable
        >
            <SplitterInner />
        </SplitterClass>
    );
}
