import { Counter } from '../../Counter';
import { FFMpegStream } from '../stream/FFMpegStream';
import { FFMpegFilter } from './FFMpegFilter';

interface Option {
    startInSecond: number;
    endInSecond: number;
}

export class FFMpegTrimFilter extends FFMpegFilter {
    private static readonly counter = new Counter();
    private readonly input: FFMpegStream;
    private readonly output: FFMpegStream;
    private readonly option: Option;

    constructor(input: FFMpegStream, option: Option) {
        super();
        this.input = input;
        this.option = option;
        this.output = new FFMpegStream(`trim_${FFMpegTrimFilter.counter.getAndInc()}`, this);
    }

    get inputs(): [FFMpegStream] {
        return [this.input];
    }

    get outputs(): [FFMpegStream] {
        return [this.output];
    }

    buildCommand(): string {
        return [
            this.input.buildCommand(),
            `[${this.input.id}]trim=${this.option.startInSecond.toFixed(3)}:${this.option.endInSecond.toFixed(3)}[${this.output.id}]`,
        ]
            .filter((command) => command !== '')
            .join('; ');
    }
}

export function trim(input: FFMpegStream, option: Option): FFMpegStream {
    return new FFMpegTrimFilter(input, option).outputs[0];
}
