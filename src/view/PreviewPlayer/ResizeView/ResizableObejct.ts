import { NumericAnimatableValue } from '../../../model/objects/AnimatableValue';
import { BaseObject } from '../../../model/objects/BaseObject';

export interface ResizableObject extends BaseObject {
    x: NumericAnimatableValue;
    y: NumericAnimatableValue;
    width: NumericAnimatableValue;
    height: NumericAnimatableValue;
}

export function isResizable(object: BaseObject): object is ResizableObject {
    return 'x' in object && 'y' in object && 'width' in object && 'height' in object;
}
