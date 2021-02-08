import { UUID } from '../../lib/UUID';
import { CaptionObject } from './BaseObject';
import { AudioObject } from './AudioObject';

describe('isAudio', () => {
    it('Should be able to distinguish', () => {
        const video: AudioObject = {
            type: 'AUDIO',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            srcFilePath: 'path/to/video',
        };
        expect(AudioObject.isAudio(video)).toBe(true);

        const object: CaptionObject = {
            type: 'NOT_AUDIO',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
        };
        expect(AudioObject.isAudio(object)).toBe(false);
    });
});

describe('type', () => {
    it('Should be "AUDIO"', () => {
        expect(AudioObject.type).toBe('AUDIO');
    });
});
