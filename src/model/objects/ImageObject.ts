import { ImageFrame } from '../frame/ImageFrame';
import { AnimatableValue, AnimatableValueType, NumericAnimatableValue } from './AnimatableValue';
import { BaseObject, BaseObjectProps } from './BaseObject';

interface Props extends BaseObjectProps {
    srcFilePath: string;
    x?: NumericAnimatableValue;
    y?: NumericAnimatableValue;
    width?: NumericAnimatableValue;
    height?: NumericAnimatableValue;
}

export class ImageObject extends BaseObject {
    readonly srcFilePath: string;
    readonly x: NumericAnimatableValue;
    readonly y: NumericAnimatableValue;
    readonly width: NumericAnimatableValue;
    readonly height: NumericAnimatableValue;

    constructor(data: Props) {
        super(data);
        this.srcFilePath = data.srcFilePath;
        this.x = data.x ?? AnimatableValue.constant(100, AnimatableValueType.Numeric);
        this.y = data.y ?? AnimatableValue.constant(100, AnimatableValueType.Numeric);
        this.width = data.width ?? AnimatableValue.constant(200, AnimatableValueType.Numeric);
        this.height = data.height ?? AnimatableValue.constant(200, AnimatableValueType.Numeric);
    }

    clone(props: Partial<Props> = {}): ImageObject {
        return new ImageObject({
            id: this.id,
            startInMS: this.startInMS,
            endInMS: this.endInMS,
            srcFilePath: this.srcFilePath,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            ...props,
        });
    }

    getFrame(timeInMS: number): ImageFrame {
        return {
            id: this.id,
            type: 'IMAGE',
            srcFilePath: this.srcFilePath,
            x: AnimatableValue.interpolate(this.x, this.startInMS, this.endInMS, timeInMS),
            y: AnimatableValue.interpolate(this.y, this.startInMS, this.endInMS, timeInMS),
            width: AnimatableValue.interpolate(this.width, this.startInMS, this.endInMS, timeInMS),
            height: AnimatableValue.interpolate(this.height, this.startInMS, this.endInMS, timeInMS),
        };
    }

    serialize(): string {
        throw new Error('NIY');
    }
}
