import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useFormState<T>(defaultValue: T): [T, Dispatch<SetStateAction<T>>];
export function useFormState<T>(defaultValue: T, value: T): [T, Dispatch<SetStateAction<T>>];
export function useFormState<T>(...args: T[]): [T, Dispatch<SetStateAction<T>>] {
    const isValueSpecified = args.length === 2;
    const defaultValue = args[0];
    const value = args[1];

    const [currentValue, setCurrentValue] = useState(defaultValue);
    useEffect(() => {
        setCurrentValue(defaultValue);
    }, [defaultValue]);

    return [isValueSpecified ? value : currentValue, setCurrentValue];
}
