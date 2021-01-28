import { renderHook } from '@testing-library/react-hooks';
import { useSortedArray } from './useSortedArray';

it('Should return sorted array', () => {
    const hook = renderHook(() => {
        return useSortedArray([3, 1, 2]);
    });

    const sortedItems = hook.result.current;
    expect(sortedItems).toEqual([1, 2, 3]);
});

it('Should return same instance if nothing changed', () => {
    const items = [3, 1, 2];

    const hook = renderHook(() => {
        return useSortedArray(items);
    });
    const sortedItems1 = hook.result.current;

    hook.rerender();
    const sortedItems2 = hook.result.current;

    expect(sortedItems1).toBe(sortedItems2);
});

it('Should return different instance if input is changed', () => {
    const hook = renderHook(
        (items) => {
            return useSortedArray(items);
        },
        { initialProps: [3, 1, 2] }
    );
    const sortedItems1 = hook.result.current;
    expect(sortedItems1).toEqual([1, 2, 3]);

    hook.rerender([4, 6, 5]);
    const sortedItems2 = hook.result.current;
    expect(sortedItems2).toEqual([4, 5, 6]);
});

it('Should use comparator if specified', () => {
    const hook1 = renderHook(() => {
        return useSortedArray(['10', '2', '1']);
    });
    expect(hook1.result.current).toEqual(['1', '10', '2']);

    const hook2 = renderHook(() => {
        return useSortedArray(['10', '2', '1'], (text1, text2) => {
            if (text1.length === text2.length) {
                return text1 < text2 ? -1 : text1 === text2 ? 0 : +1;
            } else {
                return text1.length < text2.length ? -1 : text1.length === text2.length ? 0 : +1;
            }
        });
    });
    expect(hook2.result.current).toEqual(['1', '2', '10']);
});
