import { Counter } from '../../Counter';
import { FFMpegStream } from '../stream/FFMpegStream';
import { FFMpegFilter } from './FFMpegFilter';

interface Option {
    volume: number;
}

export class FFMpegVolumeFilter extends FFMpegFilter {
    private static readonly counter = new Counter();
    private readonly input: FFMpegStream;
    private readonly output: FFMpegStream;
    private readonly option: Option;

    constructor(input: FFMpegStream, option: Option) {
        super();
        this.input = input;
        this.option = option;
        this.output = new FFMpegStream(`avolume_${FFMpegVolumeFilter.counter.getAndInc()}`, this);
    }

    get inputs(): [FFMpegStream] {
        return [this.input];
    }

    get outputs(): [FFMpegStream] {
        return [this.output];
    }

    buildCommand(): string {
        return [this.input.buildCommand(), `[${this.input.id}]volume=volume=${this.option.volume.toFixed(3)}[${this.output.id}]`]
            .filter((command) => command !== '')
            .join('; ');
    }
}

export function volume(input: FFMpegStream, option: Option): FFMpegStream {
    return new FFMpegVolumeFilter(input, option).outputs[0];
}
