declare module '@ffmpeg-installer/ffmpeg' {
    export interface FFMpegInfo {
        path: string;
        version: string;
    }

    export const path: string;
    export const version: string;
}
