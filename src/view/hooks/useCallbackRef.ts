import { useCallback, useRef } from 'react';

export function useCallbackRef<T extends (...args: unknown[]) => unknown>(fn: T): T {
    const callbackRef = useRef<T>(fn);
    callbackRef.current = fn;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,react-hooks/exhaustive-deps
    return useCallback<T>(((...args: unknown[]) => callbackRef.current(...args)) as T, []);
}
