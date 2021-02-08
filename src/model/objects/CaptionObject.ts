import { BaseObject } from './BaseObject';

function isCaption(object: BaseObject): object is CaptionObject {
    return object.type === CaptionObject.type;
}

export const CaptionObject = {
    type: 'CAPTION',
    isCaption,
} as const;

export interface CaptionObject extends BaseObject {
    type: typeof CaptionObject.type;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
}
