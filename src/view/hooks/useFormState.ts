import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useFormState<T>(defaultValue: T, value?: T | undefined): [T, Dispatch<SetStateAction<T>>] {
    const [currentValue, setCurrentValue] = useState(defaultValue);
    useEffect(() => {
        setCurrentValue(defaultValue);
    }, [defaultValue]);

    return [value ?? currentValue, setCurrentValue];
}
