/**
 * Same as React's useContext API, but available in both react-dom and react-pixi-fiber renderers.
 */
import { EventEmitter } from 'events';
import * as React from 'react';
import { useEffect } from 'react';
import { noop } from '../../lib/util';
import { UUID } from '../../lib/UUID';
import { useForceUpdate } from './useForceUpdate';

const emitterMap = new Map<string, EventEmitter>();
const valueMap = new Map<string, unknown>();

export class Context2<T> {
    readonly id: string = UUID();

    readonly Provider: React.ComponentType<React.PropsWithChildren<{ value: T }>> = (props: React.PropsWithChildren<{ value: T }>) => {
        const { value, children } = props;

        if (value !== valueMap.get(this.id)) {
            valueMap.set(this.id, value);
            emitterMap.get(this.id)?.emit('change');
        }

        return <>{children}</>;
    };
}

export function createContext2<T>(): Context2<T> {
    return new Context2<T>();
}

export function useContext2<T>(context: Context2<T>): T {
    const forceUpdate = useForceUpdate();
    const emitter = emitterMap.get(context.id);

    useEffect(() => {
        if (emitter === undefined) return noop;

        emitter.on('change', forceUpdate);
        return () => emitter.off('change', forceUpdate);
    }, [emitter, forceUpdate]);

    return valueMap.get(context.id) as T;
}
