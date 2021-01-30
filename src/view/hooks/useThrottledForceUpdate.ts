import { useCallback, useRef } from 'react';
import { useCallbackRef } from './useCallbackRef';
import { useForceUpdate } from './useForceUpdate';

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
