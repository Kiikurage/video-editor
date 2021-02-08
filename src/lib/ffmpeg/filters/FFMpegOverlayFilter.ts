import { Counter } from '../../Counter';
import { FFMpegStream } from '../stream/FFMpegStream';
import { FFMpegFilter } from './FFMpegFilter';

interface Option {
    x: number;
    y: number;
    enable: string;
}

export class FFMpegOverlayFilter extends FFMpegFilter {
    private static readonly counter = new Counter();
    private readonly base: FFMpegStream;
    private readonly overlay: FFMpegStream;
    private readonly output: FFMpegStream;
    private readonly option: Option;

    constructor(base: FFMpegStream, overlay: FFMpegStream, option: Option) {
        super();
        this.base = base;
        this.overlay = overlay;
        this.option = option;
        this.output = new FFMpegStream(`overlay_${FFMpegOverlayFilter.counter.getAndInc()}`, this);
    }

    get inputs(): [FFMpegStream, FFMpegStream] {
        return [this.base, this.overlay];
    }

    get outputs(): [FFMpegStream] {
        return [this.output];
    }

    buildCommand(): string {
        return [
            this.base.buildCommand(),
            this.overlay.buildCommand(),
            `[${this.base.id}][${this.overlay.id}]overlay=x=${this.option.x}:y=${this.option.y}:enable='${this.option.enable}'[${this.output.id}]`,
        ]
            .filter((command) => command !== '')
            .join('; ');
    }
}

export function overlay(base: FFMpegStream, overlay: FFMpegStream, option: Option): FFMpegStream {
    return new FFMpegOverlayFilter(base, overlay, option).outputs[0];
}
