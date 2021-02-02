import { useCallback, useReducer, useRef } from 'react';
import { useCallbackRef } from './useCallbackRef';

function useForceUpdate(): () => void {
    const [_, forceUpdate] = useReducer((x: number) => x + 1, 0);

    return forceUpdate;
}

export function useThrottledForceUpdate(): () => void {
    const rerenderTimerIdRef = useRef<number | null>(null);
    const forceUpdate = useForceUpdate();

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
