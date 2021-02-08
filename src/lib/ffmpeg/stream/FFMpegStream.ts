import { FFMpegFilter } from '../filters/FFMpegFilter';

export class FFMpegStream {
    readonly id: string;
    readonly parentFilter: FFMpegFilter | null;

    constructor(id: string, parentFilter: FFMpegFilter | null = null) {
        this.id = id;
        this.parentFilter = parentFilter;
    }

    buildCommand(): string {
        return this.parentFilter?.buildCommand() ?? '';
    }
}

export interface FFMpegStreamMap {
    audio: FFMpegStream | null;
    video: FFMpegStream | null;
}
