import { useMemo } from 'react';

export function useSortedArray<T>(items: readonly T[], comparator?: (item1: T, item2: T) => -1 | 0 | 1): T[] {
    return useMemo(() => items.slice().sort(comparator), [comparator, items]);
}
