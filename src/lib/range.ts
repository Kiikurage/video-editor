import { assert } from './util';

export function range(end: number): number[];
export function range(start: number, end: number): number[];
export function range(start: number, end: number, step: number): number[];
export function range(...args: number[]): number[] {
    let start: number;
    let end: number;
    let step: number;

    switch (args.length) {
        case 1:
            start = 0;
            end = args[0];
            step = 1;
            break;

        case 2:
            start = args[0];
            end = args[1];
            step = 1;
            break;

        case 3:
            start = args[0];
            end = args[1];
            step = args[2];
            break;

        default:
            assert(false, 'Invalid number of arguments');
    }

    const result: number[] = [];
    let i = start;
    while (i < end) {
        result.push(i);
        i += step;
    }

    return result;
}
