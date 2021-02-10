import { UUID } from '../../lib/UUID';
import { BaseObject } from './BaseObject';
import { TextObject } from './TextObject';

describe('isText', () => {
    it('Should be able to distinguish', () => {
        const textObject: TextObject = {
            type: 'TEXT',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            x: 0,
            y: 0,
            height: 100,
            width: 100,
            text: 'This is text',
            locked: false,
        };
        expect(TextObject.isText(textObject)).toBe(true);

        const object: BaseObject = {
            type: 'NOT_TEXT',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            locked: false,
        };
        expect(TextObject.isText(object)).toBe(false);
    });
});

describe('type', () => {
    it('Should be "TEXT"', () => {
        expect(TextObject.type).toBe('TEXT');
    });
});
