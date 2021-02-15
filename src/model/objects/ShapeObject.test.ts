import { UUID } from '../../lib/UUID';
import { AnimatableValueType } from './AnimatableValue';
import { BaseObject } from './BaseObject';
import { ShapeObject, ShapeType } from './ShapeObject';

describe('isShape', () => {
    it('Should be able to distinguish', () => {
        const shapeObject: ShapeObject = {
            type: 'SHAPE',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            locked: false,
            shapeType: ShapeType.CIRCLE,
            x: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            y: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            width: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            height: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            fill: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 0xffffff }] },
            stroke: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 0x000000 }] },
            anchor: [],
        };
        expect(ShapeObject.isShape(shapeObject)).toBe(true);

        const object: BaseObject = {
            type: 'NOT_SHAPE',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            locked: false,
        };
        expect(ShapeObject.isShape(object)).toBe(false);
    });
});

describe('type', () => {
    it('Should be "SHAPE"', () => {
        expect(ShapeObject.type).toBe('SHAPE');
    });
});
