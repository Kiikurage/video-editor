import { NumericAnimatableValue } from './AnimatableValue';
import { BaseObject } from './BaseObject';

function isImage(object: BaseObject): object is ImageObject {
    return object.type === ImageObject.type;
}

export const ImageObject = {
    type: 'IMAGE',
    isImage,
} as const;

export interface ImageObject extends BaseObject {
    type: typeof ImageObject.type;
    srcFilePath: string;
    x: NumericAnimatableValue;
    y: NumericAnimatableValue;
    width: NumericAnimatableValue;
    height: NumericAnimatableValue;
}
