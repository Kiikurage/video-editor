declare module '@ffprobe-installer/ffprobe' {
    export interface FFProbeInfo {
        path: string;
        version: string;
    }

    export const path: string;
    export const version: string;
}
