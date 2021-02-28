import { ShapeFrame } from '../frame/ShapeFrame';
import { AnimatableValue, AnimatableValueType, ColorAnimatableValue, NumericAnimatableValue } from './AnimatableValue';
import { BaseObject, BaseObjectProps } from './BaseObject';

interface Props extends BaseObjectProps {
    shapeType?: string;
    x?: NumericAnimatableValue;
    y?: NumericAnimatableValue;
    width?: NumericAnimatableValue;
    height?: NumericAnimatableValue;
    fill?: ColorAnimatableValue;
    stroke?: ColorAnimatableValue;
}

export class ShapeObject extends BaseObject {
    readonly shapeType: string;
    readonly x: NumericAnimatableValue;
    readonly y: NumericAnimatableValue;
    readonly width: NumericAnimatableValue;
    readonly height: NumericAnimatableValue;
    readonly fill: ColorAnimatableValue;
    readonly stroke: ColorAnimatableValue;

    constructor(data: Props) {
        super(data);
        this.shapeType = data.shapeType ?? 'RECTANGLE';
        this.x = data.x ?? AnimatableValue.constant(100, AnimatableValueType.Numeric);
        this.y = data.y ?? AnimatableValue.constant(100, AnimatableValueType.Numeric);
        this.width = data.width ?? AnimatableValue.constant(200, AnimatableValueType.Numeric);
        this.height = data.height ?? AnimatableValue.constant(200, AnimatableValueType.Numeric);
        this.fill = data.fill ?? AnimatableValue.constant(0xf8f8f8, AnimatableValueType.Color);
        this.stroke = data.stroke ?? AnimatableValue.constant(0x000000, AnimatableValueType.Color);
    }

    clone(props: Partial<Props> = {}): ShapeObject {
        return new ShapeObject({
            id: this.id,
            startInMS: this.startInMS,
            endInMS: this.endInMS,
            shapeType: this.shapeType,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            fill: this.fill,
            stroke: this.stroke,
            ...props,
        });
    }

    getFrame(timeInMS: number): ShapeFrame {
        return {
            id: this.id,
            type: 'SHAPE',
            shapeType: this.shapeType,
            x: AnimatableValue.interpolate(this.x, this.startInMS, this.endInMS, timeInMS),
            y: AnimatableValue.interpolate(this.y, this.startInMS, this.endInMS, timeInMS),
            width: AnimatableValue.interpolate(this.width, this.startInMS, this.endInMS, timeInMS),
            height: AnimatableValue.interpolate(this.height, this.startInMS, this.endInMS, timeInMS),
            fill: AnimatableValue.interpolate(this.fill, this.startInMS, this.endInMS, timeInMS),
            stroke: AnimatableValue.interpolate(this.stroke, this.startInMS, this.endInMS, timeInMS),
        };
    }

    serialize(): string {
        throw new Error('NIY');
    }
}
