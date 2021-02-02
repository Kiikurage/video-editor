import { UUID } from '../../lib/UUID';
import { BaseObject } from './BaseObject';
import { VideoObject } from './VideoObject';

describe('isVideo', () => {
    it('Should be able to distinguish', () => {
        const video: VideoObject = {
            type: 'VIDEO',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            x: 0,
            y: 0,
            height: 100,
            width: 100,
            srcFilePath: 'path/to/video',
        };
        expect(VideoObject.isVideo(video)).toBe(true);

        const object: BaseObject = {
            type: 'NOT_VIDEO',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            x: 0,
            y: 0,
            height: 100,
            width: 100,
        };
        expect(VideoObject.isVideo(object)).toBe(false);
    });
});

describe('type', () => {
    it('Should be "VIDEO"', () => {
        expect(VideoObject.type).toBe('VIDEO');
    });
});
