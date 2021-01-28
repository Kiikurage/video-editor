import { renderHook } from '@testing-library/react-hooks';
import { useCallbackRef } from './useCallbackRef';

it('Return same callback instance, but dependencies should be updated', () => {
    const hook = renderHook(
        (x) => {
            return useCallbackRef(() => x);
        },
        {
            initialProps: 1,
        }
    );

    const fn1 = hook.result.current;
    expect(fn1()).toBe(1);

    hook.rerender(2);

    const fn2 = hook.result.current;
    expect(fn2()).toBe(2);

    expect(fn1).toBe(fn2);
});
