import { BaseObject } from './BaseObject';

function isSized(object: BaseObject): object is SizedObject {
    return 'x' in object && 'y' in object && 'width' in object && 'height' in object;
}

export const SizedObject = {
    isSized,
} as const;

export interface SizedObject extends BaseObject {
    x: number;
    y: number;
    width: number;
    height: number;
}
