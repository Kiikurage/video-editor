import { NumericAnimatableValue } from './AnimatableValue';
import { BaseObject } from './BaseObject';
import { FontStyle } from './FontStyle';

function isText(object: BaseObject): object is TextObject {
    return object.type === TextObject.type;
}

export const TextObject = {
    type: 'TEXT',
    isText: isText,
} as const;

export interface TextObject extends BaseObject {
    type: typeof TextObject.type;
    text: string;
    fontStyle: FontStyle;
    x: NumericAnimatableValue;
    y: NumericAnimatableValue;
    width: NumericAnimatableValue;
    height: NumericAnimatableValue;
}
