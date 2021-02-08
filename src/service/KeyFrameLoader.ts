import * as childProcess from 'child_process';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import { promisify } from 'util';
import { getFFMpegInfo } from '../ipc/renderer/getFFMepgInfo';
import { EventEmitterEvents } from '../model/EventEmitterEvents';

type KeyframeLoaderEvents = EventEmitterEvents<{
    load: void;
}>;

export interface KeyframeLoaderRecord {
    timeInMS: number;
    filePath: string;
}

export class KeyframeLoader extends EventEmitter implements KeyframeLoaderEvents {
    readonly records: KeyframeLoaderRecord[] = [];
    readonly srcFilePath: string;
    private readonly tmpDir: string;
    private readonly cleanUpFunction: () => void;
    private readonly keyframeHeight = 54;
    private extractOperationIDCounter = 0;

    constructor(videoPath: string) {
        super();
        this.srcFilePath = videoPath;

        const tmpDirInfo = tmp.dirSync({ unsafeCleanup: true });
        this.tmpDir = tmpDirInfo.name;
        this.cleanUpFunction = tmpDirInfo.removeCallback;
    }

    async extractKeyframe(): Promise<void> {
        return this.extractKeyframe2();
    }

    clearAllCache(): void {
        // this.cleanUpFunction();
        this.records.length = 0;
    }

    /**
     * Return the keyframe closest to the specified time position, or undefined if nothing loaded.
     */
    getKeyframe(timeInMS: number, windowSizeInMS = 500): KeyframeLoaderRecord | undefined {
        let low = 0,
            high = this.records.length,
            mid = (low + high) >> 1;

        while (high - low > 1) {
            if (this.records[mid].timeInMS > timeInMS) {
                high = mid;
                mid = (low + high) >> 1;
            } else if (this.records[mid].timeInMS < timeInMS) {
                low = mid;
                mid = (low + high) >> 1;
            } else {
                break;
            }
        }
        const record = this.records[mid];

        return record !== undefined && Math.abs(record.timeInMS - timeInMS) < windowSizeInMS ? record : undefined;
    }

    // private async extractKeyframe2(startInMS: number, endInMS: number, fps: number): Promise<void> {
    private async extractKeyframe2(): Promise<void> {
        if ((await fs.readdir(this.tmpDir)).length > 0) return;

        const extractOperationID = this.extractOperationIDCounter++;
        const { path: ffmpegPath } = await getFFMpegInfo();
        await promisify(childProcess.exec)(
            [
                ffmpegPath,
                // `-ss ${(startInMS / 1000).toFixed(3)}`,
                // `-to ${(endInMS / 1000).toFixed(3)}`,
                // '-skip_frame nokey',
                `-i ${this.srcFilePath}`,
                '-vsync 0',
                '-f image2',
                // `-vf "fps=${fps} [tmp]; [tmp] scale=-1:${this.keyframeHeight} [out]"`,
                `-vf "fps=2 [tmp]; [tmp] scale=-1:${this.keyframeHeight} [out]"`,
                path.join(this.tmpDir, `./${extractOperationID}-%09d.bmp`),
            ].join(' ')
        );

        const files = (await fs.readdir(this.tmpDir)).filter((fileName) => fileName.startsWith(`${extractOperationID}-`)).sort();

        const result: KeyframeLoaderRecord[] = files.map((filePath, i) => {
            return {
                // timeInMS: startInMS + i * 500,
                timeInMS: i * 500,
                filePath: path.join(this.tmpDir, filePath),
            };
        });

        this.records.push(...result);
        this.records.sort((r1, r2) => r1.timeInMS - r2.timeInMS);
        this.emit('load');
    }
}
