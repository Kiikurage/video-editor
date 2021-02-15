import { ColorAnimatableValue, NumericAnimatableValue } from './AnimatableValue';
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
    shapeType: ShapeType;
    x: NumericAnimatableValue;
    y: NumericAnimatableValue;
    width: NumericAnimatableValue;
    height: NumericAnimatableValue;
    anchor: NumericAnimatableValue[];

    // TODO: Support other fill/stroke type like gradation, pattern, etc.
    fill: ColorAnimatableValue;
    stroke: ColorAnimatableValue;
}

export const ShapeType = {
    RECTANGLE: 'RECTANGLE',
    CIRCLE: 'CIRCLE',
};
export type ShapeType = typeof ShapeType[keyof typeof ShapeType];
