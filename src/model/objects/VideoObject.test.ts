import { UUID } from '../../lib/UUID';
import { AnimatableValueType } from './AnimatableValue';
import { BaseObject } from './BaseObject';
import { VideoObject } from './VideoObject';

describe('isVideo', () => {
    it('Should be able to distinguish', () => {
        const video: VideoObject = {
            type: 'VIDEO',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            srcFilePath: 'path/to/video',
            locked: false,
            x: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            y: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            width: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            height: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
        };
        expect(VideoObject.isVideo(video)).toBe(true);

        const object: BaseObject = {
            type: 'NOT_VIDEO',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            locked: false,
        };
        expect(VideoObject.isVideo(object)).toBe(false);
    });
});

describe('type', () => {
    it('Should be "VIDEO"', () => {
        expect(VideoObject.type).toBe('VIDEO');
    });
});
