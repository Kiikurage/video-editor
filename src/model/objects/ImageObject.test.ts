import { UUID } from '../../lib/UUID';
import { BaseObject } from './BaseObject';
import { ImageObject } from './ImageObject';

describe('isImage', () => {
    it('Should be able to distinguish', () => {
        const image: ImageObject = {
            type: 'IMAGE',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            x: 0,
            y: 0,
            height: 100,
            width: 100,
            srcFilePath: 'path/to/image',
            locked: false,
        };
        expect(ImageObject.isImage(image)).toBe(true);

        const object: BaseObject = {
            type: 'NOT_IMAGE',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            locked: false,
        };
        expect(ImageObject.isImage(object)).toBe(false);
    });
});

describe('type', () => {
    it('Should be "IMAGE"', () => {
        expect(ImageObject.type).toBe('IMAGE');
    });
});
