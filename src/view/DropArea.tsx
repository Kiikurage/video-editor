import * as React from 'react';
import { useRef, useState } from 'react';
import styled from 'styled-components';

const Base = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`;

const Overlay = styled.div<{ active: boolean }>`
    background: rgba(255, 255, 255, 0.8);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: ${(props) => (props.active ? 1 : 0)};
    z-index: ${(props) => (props.active ? 99999999 : 0)};
    border: 10px solid #4d90fe;
    font-size: 24px;
    color: #4d90fe;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
`;

interface Props {
    onFileDrop: (file: File) => void;
}

export function DropArea(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { children, onFileDrop } = props;

    const [isActive, setActive] = useState(false);
    const baseRef = useRef<HTMLElement | null>(null);

    const onDragOver = (ev: React.DragEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
    };

    const onDragEnter = (ev: React.DragEvent) => {
        if (ev.relatedTarget && baseRef.current?.contains(ev.relatedTarget as Node)) {
            return;
        }

        setActive(true);
        ev.preventDefault();
        ev.stopPropagation();
    };

    const onDragLeave = (ev: React.DragEvent) => {
        if (ev.relatedTarget && baseRef.current?.contains(ev.relatedTarget as Node)) {
            return;
        }

        setActive(false);
        ev.preventDefault();
        ev.stopPropagation();
    };

    const onDrop = (ev: React.DragEvent) => {
        setActive(false);

        const file = ev.dataTransfer.files.item(0);
        if (!file) {
            return;
        }

        onFileDrop(file);
    };

    return (
        <Base
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            ref={(e) => (baseRef.current = e)}
        >
            <Overlay active={isActive}>ドロップ: 素材を追加</Overlay>
            {children}
        </Base>
    );
}
