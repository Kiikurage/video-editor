import { TextFrame } from '../frame/TextFrame';
import { AnimatableValue, AnimatableValueType, NumericAnimatableValue } from './AnimatableValue';
import { BaseObject, BaseObjectProps } from './BaseObject';

export type HorizontalAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'center' | 'bottom';

interface Props extends BaseObjectProps {
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fill?: number;
    stroke?: number;
    strokeThickness?: number;
    horizontalAlign?: HorizontalAlign;
    verticalAlign?: VerticalAlign;
    x?: NumericAnimatableValue;
    y?: NumericAnimatableValue;
    width?: NumericAnimatableValue;
    height?: NumericAnimatableValue;
}

export class TextObject extends BaseObject {
    readonly text: string;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly fontWeight: string;
    readonly fill: number;
    readonly stroke: number;
    readonly strokeThickness: number;
    readonly horizontalAlign: HorizontalAlign;
    readonly verticalAlign: VerticalAlign;
    readonly x: NumericAnimatableValue;
    readonly y: NumericAnimatableValue;
    readonly width: NumericAnimatableValue;
    readonly height: NumericAnimatableValue;

    constructor(data: Props) {
        super(data);
        this.text = data.text ?? 'テキスト';
        this.fontFamily = data.fontFamily ?? 'Noto Sans JP';
        this.fontSize = data.fontSize ?? 40;
        this.fontWeight = data.fontWeight ?? '500';
        this.fill = data.fill ?? 0x000000;
        this.stroke = data.stroke ?? 0xffffff;
        this.strokeThickness = data.strokeThickness ?? 1;
        this.horizontalAlign = data.horizontalAlign ?? 'left';
        this.verticalAlign = data.verticalAlign ?? 'top';
        this.x = data.x ?? AnimatableValue.constant(100, AnimatableValueType.Numeric);
        this.y = data.y ?? AnimatableValue.constant(100, AnimatableValueType.Numeric);
        this.width = data.width ?? AnimatableValue.constant(200, AnimatableValueType.Numeric);
        this.height = data.height ?? AnimatableValue.constant(200, AnimatableValueType.Numeric);
    }

    clone(props: Partial<Props> = {}): TextObject {
        return new TextObject({
            id: this.id,
            startInMS: this.startInMS,
            endInMS: this.endInMS,
            text: this.text,
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            fontWeight: this.fontWeight,
            fill: this.fill,
            stroke: this.stroke,
            strokeThickness: this.strokeThickness,
            horizontalAlign: this.horizontalAlign,
            verticalAlign: this.verticalAlign,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            ...props,
        });
    }

    getFrame(timeInMS: number): TextFrame {
        return {
            id: this.id,
            type: 'TEXT',
            text: this.text,
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            fontWeight: this.fontWeight,
            fill: this.fill,
            stroke: this.stroke,
            strokeThickness: this.strokeThickness,
            horizontalAlign: this.horizontalAlign,
            verticalAlign: this.verticalAlign,
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
