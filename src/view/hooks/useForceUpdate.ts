import { useCallback, useReducer, useRef } from 'react';
import { useCallbackRef } from './useCallbackRef';

export function useForceUpdate(): () => void {
    const rerenderTimerIdRef = useRef<number | null>(null);
    const [_, forceUpdate] = useReducer((x: number) => x + 1, 0);

    const mainCallback = useCallbackRef(() => {
        rerenderTimerIdRef.current = null;
        forceUpdate();
    });

    return useCallback(() => {
        if (rerenderTimerIdRef.current === null) {
            rerenderTimerIdRef.current = requestAnimationFrame(mainCallback);
        }
    }, [mainCallback]);
}
