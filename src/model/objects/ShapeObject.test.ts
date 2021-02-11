import { UUID } from '../../lib/UUID';
import { BaseObject } from './BaseObject';
import { ShapeObject, ShapeType } from './ShapeObject';

describe('isShape', () => {
    it('Should be able to distinguish', () => {
        const shapeObject: ShapeObject = {
            type: 'SHAPE',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            x: 0,
            y: 0,
            height: 100,
            width: 100,
            anchor: [],
            locked: false,
            shapeType: ShapeType.CIRCLE,
            fill: 0x000000,
            stroke: 0xffffff,
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
