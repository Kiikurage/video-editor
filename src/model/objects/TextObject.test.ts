import { UUID } from '../../lib/UUID';
import { AnimatableValueType } from './AnimatableValue';
import { BaseObject } from './BaseObject';
import { TextObject } from './TextObject';

describe('isText', () => {
    it('Should be able to distinguish', () => {
        const textObject: TextObject = {
            type: 'TEXT',
            id: UUID(),
            startInMS: 0,
            endInMS: 100,
            text: 'This is text',
            locked: false,
            fontStyle: {
                fontFamily: 'Noto Sans JP',
                fontSize: 80,
                fontWeight: 'bold',
                fill: 0xaa66ff,
                stroke: 0xffffff,
                strokeThickness: 10,
                horizontalAlign: 'left',
                verticalAlign: 'top',
            },
            x: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            y: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            width: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
            height: { type: AnimatableValueType.Numeric, keyframes: [{ timing: 0, value: 200 }] },
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
