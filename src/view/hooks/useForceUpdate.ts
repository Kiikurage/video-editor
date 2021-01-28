import { useReducer } from 'react';

export function useForceUpdate(): () => void {
    const [_, forceUpdate] = useReducer((x: number) => x + 1, 0);

    return forceUpdate;
}
