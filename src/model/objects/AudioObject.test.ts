import { UUID } from '../../lib/UUID';
import { AnimatableValueType } from './AnimatableValue';
import { AudioObject } from './AudioObject';
import { BaseObject } from './BaseObject';

describe('isAudio', () => {
    it('Should be able to distinguish', () => {
        const video: AudioObject = {
            type: 'AUDIO',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            srcFilePath: 'path/to/video',
            locked: false,
            volume: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 0.5 }] },
        };
        expect(AudioObject.isAudio(video)).toBe(true);

        const object: BaseObject = {
            type: 'NOT_AUDIO',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            locked: false,
        };
        expect(AudioObject.isAudio(object)).toBe(false);
    });
});

describe('type', () => {
    it('Should be "AUDIO"', () => {
        expect(AudioObject.type).toBe('AUDIO');
    });
});
