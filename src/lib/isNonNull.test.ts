import { isNonNull } from './isNonNull';

it('Basic usage', () => {
    expect(isNonNull(null)).toBe(false);
    expect(isNonNull(undefined)).toBe(false);
    expect(isNonNull(0)).toBe(true);
    expect(isNonNull('')).toBe(true);
    expect(isNonNull(false)).toBe(true);
    expect(isNonNull({})).toBe(true);
});
