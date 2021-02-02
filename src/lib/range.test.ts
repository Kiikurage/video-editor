import { range } from './range';

describe('range(end)', () => {
    it('When end is positive value', () => {
        expect(range(5)).toStrictEqual([0, 1, 2, 3, 4]);
    });

    it('When end is negative value', () => {
        expect(range(-1)).toStrictEqual([]);
    });
});

describe('range(start, end)', () => {
    it('Normal case', () => {
        expect(range(3, 5)).toStrictEqual([3, 4]);
    });

    it('When end smaller than start', () => {
        expect(range(5, 3)).toStrictEqual([]);
    });

    it('When start is negative value', () => {
        expect(range(-2, 3)).toStrictEqual([-2, -1, 0, 1, 2]);
    });
});

describe('range(start, end, step)', () => {
    it('Normal case', () => {
        expect(range(1, 9, 2)).toStrictEqual([1, 3, 5, 7]);
    });

    it('When step is larger than (end-start)', () => {
        expect(range(1, 2, 3)).toStrictEqual([1]);
    });
});
