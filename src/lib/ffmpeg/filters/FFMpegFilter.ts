import { FFMpegStream } from '../stream/FFMpegStream';

export abstract class FFMpegFilter {
    abstract get inputs(): FFMpegStream[];
    abstract get outputs(): FFMpegStream[];

    abstract buildCommand(): string;
}
