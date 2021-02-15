import { UUID } from '../../lib/UUID';
import { AnimatableValueType } from './AnimatableValue';
import { BaseObject } from './BaseObject';
import { ImageObject } from './ImageObject';

describe('isImage', () => {
    it('Should be able to distinguish', () => {
        const image: ImageObject = {
            type: 'IMAGE',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            srcFilePath: 'path/to/image',
            locked: false,
            x: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            y: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            width: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            height: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
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
