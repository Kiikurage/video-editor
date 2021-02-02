import { UUID } from '../../lib/UUID';
import { BaseObject } from './BaseObject';
import { CaptionObject } from './CaptionObject';

describe('isCaption', () => {
    it('Should be able to distinguish', () => {
        const caption: CaptionObject = {
            type: 'CAPTION',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            x: 0,
            y: 0,
            height: 100,
            width: 100,
            text: 'This is caption',
        };
        expect(CaptionObject.isCaption(caption)).toBe(true);

        const object: BaseObject = {
            type: 'NOT_CAPTION',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            x: 0,
            y: 0,
            height: 100,
            width: 100,
        };
        expect(CaptionObject.isCaption(object)).toBe(false);
    });
});

describe('type', () => {
    it('Should be "CAPTION"', () => {
        expect(CaptionObject.type).toBe('CAPTION');
    });
});
