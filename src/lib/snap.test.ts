import { snap } from './snap';

it('basic usage', () => {
    expect(snap(16, [20, 40, 60])).toBe(20);
    expect(snap(17, [20, 40, 60])).toBe(20);
    expect(snap(43, [20, 40, 60])).toBe(40);
    expect(snap(31, [20, 40, 60])).toBe(31);
    expect(snap(40, [20, 40, 60])).toBe(40);
});

it('When snapValues are empty, actualValue should be returned', () => {
    expect(snap(16, [])).toBe(16);
    expect(snap(17, [])).toBe(17);
    expect(snap(43, [])).toBe(43);
});
