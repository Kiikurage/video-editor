import { BaseObject } from './BaseObject';

function isShape(object: BaseObject): object is ShapeObject {
    return object.type === ShapeObject.type;
}

export const ShapeObject = {
    type: 'SHAPE',
    isShape,
} as const;

export interface ShapeObject extends BaseObject {
    type: typeof ShapeObject.type;
    x: number;
    y: number;
    width: number;
    height: number;
    shapeType: string;
    anchor: number[];

    // TODO: Support other fill/stroke type like gradation, pattern, etc.
    fill: number;
    stroke: number;
}
