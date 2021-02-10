import { convertColorFromDOMToPixi } from './convertColorFromDOMToPixi';

it('Basic usage', () => {
    expect(convertColorFromDOMToPixi('#1a2b3c')).toBe(0x1a2b3c);
    expect(convertColorFromDOMToPixi('#010203')).toBe(0x010203);
});
