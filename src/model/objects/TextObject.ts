import { BaseObject } from './BaseObject';

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
    x: number;
    y: number;
    width: number;
    height: number;
}
