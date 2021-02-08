import { Counter } from '../../Counter';
import { FFMpegStream } from './FFMpegStream';

interface Option {
    loop?: boolean;
    type: 'v' | 'a';
}

export class FFMpegInputStream extends FFMpegStream {
    private static readonly counter = new Counter();
    readonly srcFilePath: string;
    readonly option: Option;

    constructor(srcFilePath: string, option: Option) {
        super(`in_${FFMpegInputStream.counter.getAndInc()}`, null);
        this.srcFilePath = srcFilePath;
        this.option = option;
    }
}

export function input(srcFilePath: string, option: Option = { type: 'v' }): FFMpegStream {
    return new FFMpegInputStream(srcFilePath, option);
}
