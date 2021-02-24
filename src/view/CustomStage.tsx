import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext, Stage } from 'react-pixi-fiber';
import { noop } from '../lib/util';
import { Size } from '../model/Size';
import { useCallbackRef } from './hooks/useCallbackRef';

interface Props {
    options: PIXI.ApplicationOptions;
    onMouseDown?: () => void;
    canvasRef?: (canvas: HTMLCanvasElement) => void;
}

export function CustomStage(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { options, children, onMouseDown, canvasRef = noop } = props;
    const [canvasSize, setCanvasSize] = useState<Size>({ width: 1, height: 1 });

    const [app, setApp] = useState<PIXI.Application | null>(null);
    const onAppChange = useCallbackRef((app: PIXI.Application) => {
        setApp(app);
        canvasRef(app.renderer.view);
    });

    const onContainerResize = useCallbackRef((entries: ResizeObserverEntry[]) => {
        setCanvasSize({
            width: entries[0].contentRect.width,
            height: entries[0].contentRect.height,
        });
        app?.renderer.resize(entries[0].contentRect.width, entries[0].contentRect.height);
        app?.render();
    });

    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    if (resizeObserverRef.current === null) {
        resizeObserverRef.current = new ResizeObserver(onContainerResize);
    }

    useEffect(() => {
        const parent = app?.view.parentElement ?? null;
        if (parent !== null) {
            resizeObserverRef.current?.observe(parent);
            setCanvasSize({ width: parent.clientWidth, height: parent.offsetHeight });
        }

        return () => {
            if (parent !== null) {
                resizeObserverRef.current?.unobserve(parent);
            }
        };
    }, [app]);

    return (
        <Stage options={options} onMouseDown={onMouseDown}>
            <AppInstanceHandler onAppChange={onAppChange} />
            <CanvasSizeContext.Provider value={canvasSize}>{children}</CanvasSizeContext.Provider>
        </Stage>
    );
}

function AppInstanceHandler({ onAppChange }: { onAppChange: (app: PIXI.Application) => void }) {
    const app = useContext(AppContext);

    useEffect(() => onAppChange(app), [app, onAppChange]);

    return null;
}

const CanvasSizeContext = React.createContext<Size>({ width: 1, height: 1 });

export function useCanvasSize(): Size {
    return useContext(CanvasSizeContext);
}
