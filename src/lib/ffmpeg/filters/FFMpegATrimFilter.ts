import { Counter } from '../../Counter';
import { FFMpegStream } from '../stream/FFMpegStream';
import { FFMpegFilter } from './FFMpegFilter';

interface Option {
    startInSecond: number;
    endInSecond: number;
}

export class FFMpegATrimFilter extends FFMpegFilter {
    private static readonly counter = new Counter();
    private readonly input: FFMpegStream;
    private readonly output: FFMpegStream;
    private readonly option: Option;

    constructor(input: FFMpegStream, option: Option) {
        super();
        this.input = input;
        this.option = option;
        this.output = new FFMpegStream(`atrim_${FFMpegATrimFilter.counter.getAndInc()}`, this);
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
            `[${this.input.id}]atrim=${this.option.startInSecond.toFixed(3)}:${this.option.endInSecond.toFixed(3)}[${this.output.id}]`,
        ]
            .filter((command) => command !== '')
            .join('; ');
    }
}

export function atrim(input: FFMpegStream, option: Option): FFMpegStream {
    return new FFMpegATrimFilter(input, option).outputs[0];
}
