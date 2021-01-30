import { useCallback, useRef } from 'react';
import { useForceUpdate } from './useForceUpdate';

export function useThrottledForceUpdate(): () => void {
    const rerenderTimerIdRef = useRef<number | null>(null);
    const forceUpdate = useForceUpdate();

    return useCallback(() => {
        if (rerenderTimerIdRef.current !== null) {
            cancelAnimationFrame(rerenderTimerIdRef.current);
            rerenderTimerIdRef.current = null;
        }
        rerenderTimerIdRef.current = requestAnimationFrame(forceUpdate);
    }, [forceUpdate]);
}
