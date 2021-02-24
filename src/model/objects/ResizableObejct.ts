import { NumericAnimatableValue } from './AnimatableValue';
import { BaseObject, BaseObjectProps } from './BaseObject';

interface Props extends BaseObjectProps {
    x?: NumericAnimatableValue;
    y?: NumericAnimatableValue;
    width?: NumericAnimatableValue;
    height?: NumericAnimatableValue;
}

export interface ResizableObject extends BaseObject {
    x: NumericAnimatableValue;
    y: NumericAnimatableValue;
    width: NumericAnimatableValue;
    height: NumericAnimatableValue;

    clone(props?: Partial<Props>): ResizableObject;
}

export function isResizable(object: BaseObject): object is ResizableObject {
    return 'x' in object && 'y' in object && 'width' in object && 'height' in object;
}
