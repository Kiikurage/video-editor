import { formatTime } from './formatTime';

it('Basic usage', () => {
    expect(formatTime(((12 * 60 + 34) * 60 + 56) * 1000 + 780, 100)).toBe('12:34:56.78');
});

it('If digit is too short, pad with 0', () => {
    expect(formatTime(((1 * 60 + 2) * 60 + 3) * 1000, 100)).toBe('01:02:03.00');
});
