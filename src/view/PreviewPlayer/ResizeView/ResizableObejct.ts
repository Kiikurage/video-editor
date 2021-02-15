import { NumericAnimatableValue } from '../../../model/objects/AnimatableValue';
import { BaseObject } from '../../../model/objects/BaseObject';

export interface ResizableObject extends BaseObject {
    x: NumericAnimatableValue;
    y: NumericAnimatableValue;
    width: NumericAnimatableValue;
    height: NumericAnimatableValue;
}
