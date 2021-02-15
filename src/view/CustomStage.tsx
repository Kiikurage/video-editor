import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext, Stage } from 'react-pixi-fiber';
import { useCallbackRef } from './hooks/useCallbackRef';

interface Props {
    options: PIXI.ApplicationOptions;
}

export function CustomStage(props: React.PropsWithChildren<Props>): React.ReactElement {
    const { options, children } = props;

    const [app, setApp] = useState<PIXI.Application | null>(null);
    const onAppChange = useCallbackRef((app: PIXI.Application) => {
        setApp(app);
    });

    const onContainerResize = useCallbackRef((entries: ResizeObserverEntry[]) => {
        app?.renderer.resize(entries[0].contentRect.width, entries[0].contentRect.height);
    });

    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    if (resizeObserverRef.current === null) {
        resizeObserverRef.current = new ResizeObserver(onContainerResize);
    }

    useEffect(() => {
        const parent = app?.view.parentElement ?? null;

        if (parent !== null) {
            resizeObserverRef.current?.observe(parent);
        }

        return () => {
            if (parent !== null) {
                resizeObserverRef.current?.unobserve(parent);
            }
        };
    }, [app]);

    return (
        <Stage options={options}>
            <AppInstanceHandler onAppChange={onAppChange} />
            {children}
        </Stage>
    );
}

function AppInstanceHandler({ onAppChange }: { onAppChange: (app: PIXI.Application) => void }) {
    const app = useContext(AppContext);

    useEffect(() => onAppChange(app), [app, onAppChange]);

    return null;
}
