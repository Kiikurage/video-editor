import { act, renderHook } from '@testing-library/react-hooks';
import { useFormState } from './useFormState';

describe('Uncontrolled Form', () => {
    it('State should be mutable', () => {
        const hook = renderHook(
            (defaultValue: string) => {
                return useFormState(defaultValue);
            },
            {
                initialProps: 'value1',
            }
        );

        const [value1, setValue1] = hook.result.current;
        expect(value1).toBe('value1');

        act(() => setValue1('value2'));

        const [value2, _setValue2] = hook.result.current;
        expect(value2).toBe('value2');
    });

    it('When default value is changed, state value should be updated', () => {
        const hook = renderHook(
            (defaultValue: string) => {
                return useFormState(defaultValue);
            },
            {
                initialProps: 'value1',
            }
        );

        const [value1, _setValue1] = hook.result.current;
        expect(value1).toBe('value1');

        hook.rerender('value2');
        const [value2, _setValue2] = hook.result.current;
        expect(value2).toBe('value2');
    });
});

describe('Controlled Form', () => {
    it('State should be immutable', () => {
        const hook = renderHook(
            ({ defaultValue, value }: { defaultValue: string; value: string }) => {
                return useFormState(defaultValue, value);
            },
            {
                initialProps: {
                    defaultValue: 'defaultValue1',
                    value: 'value1',
                },
            }
        );

        const [value1, setValue1] = hook.result.current;
        expect(value1).toBe('value1');

        act(() => setValue1('value2'));

        const [value2, _setValue2] = hook.result.current;
        expect(value2).toBe('value1');
    });

    it('When default value is changed, state value should not be updated', () => {
        const hook = renderHook(
            ({ defaultValue, value }: { defaultValue: string; value: string }) => {
                return useFormState(defaultValue, value);
            },
            {
                initialProps: {
                    defaultValue: 'defaultValue1',
                    value: 'value1',
                },
            }
        );

        const [value1, _setValue1] = hook.result.current;
        expect(value1).toBe('value1');

        hook.rerender({ defaultValue: 'defaultValue2', value: 'value1' });
        const [value2, _setValue2] = hook.result.current;
        expect(value2).toBe('value1');
    });

    it('When value is changed, state value should be updated', () => {
        const hook = renderHook(
            ({ defaultValue, value }: { defaultValue: string; value: string }) => {
                return useFormState(defaultValue, value);
            },
            {
                initialProps: {
                    defaultValue: 'defaultValue1',
                    value: 'value1',
                },
            }
        );

        const [value1, _setValue1] = hook.result.current;
        expect(value1).toBe('value1');

        hook.rerender({ defaultValue: 'defaultValue1', value: 'value2' });
        const [value2, _setValue2] = hook.result.current;
        expect(value2).toBe('value2');
    });
});
