/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from 'react';

export function useCallbackRef<T extends (...args: any[]) => any>(fn: T): T {
    const callbackRef = useRef<T>(fn);
    callbackRef.current = fn;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,react-hooks/exhaustive-deps
    return useCallback<T>(((...args: any[]) => callbackRef.current(...args)) as T, []);
}
