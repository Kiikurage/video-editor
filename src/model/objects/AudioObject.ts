import { AudioFrame } from '../frame/AudioFrame';
import { AnimatableValue, AnimatableValueType } from './AnimatableValue';
import { BaseObject, BaseObjectProps } from './BaseObject';

interface Props extends BaseObjectProps {
    srcFilePath: string;
    volume?: AnimatableValue;
}

export class AudioObject extends BaseObject {
    readonly srcFilePath: string;
    readonly volume: AnimatableValue;

    constructor(data: Props) {
        super(data);
        this.srcFilePath = data.srcFilePath;
        this.volume = data.volume ?? AnimatableValue.constant(0.5, AnimatableValueType.Numeric);
    }

    clone(props: Partial<Props> = {}): AudioObject {
        return new AudioObject({
            startInMS: this.startInMS,
            endInMS: this.endInMS,
            srcFilePath: this.srcFilePath,
            ...props,
        });
    }

    getFrame(timeInMS: number): AudioFrame {
        return {
            id: this.id,
            type: 'AUDIO',
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            srcFilePath: this.srcFilePath,
            duration: this.endInMS - this.startInMS,
            timeInMS: timeInMS - this.startInMS,
            volume: AnimatableValue.interpolate(this.volume, this.startInMS, this.endInMS, timeInMS),
        };
    }

    serialize(): string {
        throw new Error('NIY');
    }
}
