declare module '*.svg' {
    const SVGComponent: React.FunctionComponent<React.SVGAttributes<HTMLOrSVGElement>>;

    export default SVGComponent;
}

interface HTMLVideoElement {
    requestVideoFrameCallback: (callback: () => void) => void;
}

interface BlobEvent extends Event {
    data: Blob;
    timecode: DOMHighResTimeStamp;
}

interface MediaRecorder {
    start(): void;
    stop(): void;
    addEventListener(type: 'dataavailable', handler: (ev: BlobEvent) => void): void;
    addEventListener(type: 'stop', handler: (ev: Event) => void): void;
}

declare const MediaRecorder: {
    new (stream: MediaStream): MediaRecorder;
};

interface FFmpegNameSpace {
    load(): Promise<void>;
    FS(cmd: 'writeFile', ...args: unknown[]): void;
    FS(cmd: 'readFile', path: string): Uint8Array;
    run(...args: string[]): void;
}

interface FFmpegModule {
    createFFmpeg(): FFmpegNameSpace;
    fetchFile(url: string): Promise<Uint8Array>;
}

declare const FFmpeg: FFmpegModule;
