import { convertColorFromPixiToDOM } from './convertColorFromPixiToDOM';

it('Basic usage', () => {
    expect(convertColorFromPixiToDOM(0x1a2b3c)).toBe('#1a2b3c');
    expect(convertColorFromPixiToDOM(0x010203)).toBe('#010203');
});
