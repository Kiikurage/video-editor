import { Counter } from '../../Counter';
import { FFMpegStream } from '../stream/FFMpegStream';
import { FFMpegFilter } from './FFMpegFilter';

interface Option {
    width: number;
    height: number;
}

export class FFMpegScaleFilter extends FFMpegFilter {
    private static readonly counter = new Counter();
    private readonly input: FFMpegStream;
    private readonly output: FFMpegStream;
    private readonly option: Option;

    constructor(input: FFMpegStream, option: Option) {
        super();
        this.input = input;
        this.option = option;
        this.output = new FFMpegStream(`scale_${FFMpegScaleFilter.counter.getAndInc()}`, this);
    }

    get inputs(): [FFMpegStream] {
        return [this.input];
    }

    get outputs(): [FFMpegStream] {
        return [this.output];
    }

    buildCommand(): string {
        return [this.input.buildCommand(), `[${this.input.id}]scale=${this.option.width}x${this.option.height}[${this.output.id}]`]
            .filter((command) => command !== '')
            .join('; ');
    }
}

export function scale(input: FFMpegStream, option: Option): FFMpegStream {
    return new FFMpegScaleFilter(input, option).outputs[0];
}
