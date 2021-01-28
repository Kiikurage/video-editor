import { assert, noop } from './util';

describe('noop', () => {
    it('noop returns undefined', () => {
        expect(noop()).toBe(undefined);
    });
});

describe('assert', () => {
    it('Should throw error when assertion failed', () => {
        expect(() => assert(false, 'Assertion Failed')).toThrow();
    });

    it('Should do nothing when assertion passed', () => {
        expect(() => assert(true, 'Assertion Failed')).not.toThrow();
    });
});
