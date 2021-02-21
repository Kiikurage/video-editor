import * as childProcess from 'child_process';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as tmp from 'tmp';
import { getFFMpegInfo } from '../ipc/renderer/getFFMepgInfo';
import { getFFProbeInfo } from '../ipc/renderer/getFFProbeInfo';
import { noop } from '../lib/util';
import { EventEmitterEvents } from '../model/EventEmitterEvents';

type KeyframeLoaderEvents = EventEmitterEvents<{
    load: void;
}>;

export interface KeyframeLoaderRecord {
    timeInMS: number;
    filePath: string;
}

const cacheDirectoryMap = new Map<string, string>();

export class KeyframeLoader extends EventEmitter implements KeyframeLoaderEvents {
    readonly srcFilePath: string;
    private records: KeyframeLoaderRecord[] = [];
    private readonly tmpDir: string;
    private readonly cleanUpFunction: () => void;
    private readonly keyframeHeight = 54;
    private extractOperationIDCounter = 0;

    constructor(videoPath: string) {
        super();
        this.srcFilePath = videoPath;

        const cacheDirectory = cacheDirectoryMap.get(videoPath);
        if (cacheDirectory) {
            this.tmpDir = cacheDirectory;
            this.cleanUpFunction = noop;
            void this.reloadFromDirectory();
        } else {
            const tmpDirInfo = tmp.dirSync({ unsafeCleanup: true });
            this.tmpDir = tmpDirInfo.name;
            this.cleanUpFunction = tmpDirInfo.removeCallback;
            cacheDirectoryMap.set(videoPath, this.tmpDir);
        }
    }

    async start(): Promise<void> {
        // if (this.cleanUpFunction === noop) return;
        //
        // const BATCH_SIZE_IN_MS = 1000;
        // let currentBatchStartInMS = 0;
        // const videoDuration = await this.loadVideoDurationInMS();
        //
        // while (currentBatchStartInMS < videoDuration) {
        //     await this.extractKeyframeMainLoop(currentBatchStartInMS, Math.min(currentBatchStartInMS + BATCH_SIZE_IN_MS, videoDuration), 2);
        //     await new Promise((r) => setTimeout(r, 1000));
        //     currentBatchStartInMS += BATCH_SIZE_IN_MS;
        // }
    }

    clearAllCache(): void {
        this.records.length = 0;
    }

    /**
     * Return the keyframe closest to the specified time position, or undefined if nothing loaded.
     */
    getKeyframe(timeInMS: number, windowSizeInMS = 1000): KeyframeLoaderRecord | undefined {
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

    private async extractKeyframeMainLoop(startInMS: number, endInMS: number, fps: number): Promise<void> {
        const extractOperationID = this.extractOperationIDCounter++;
        const ffmpeg = await getFFMpegInfo();
        await promisify(childProcess.exec)(
            [
                ffmpeg.path,
                `-ss ${(startInMS / 1000).toFixed(3)}`,
                `-to ${(endInMS / 1000).toFixed(3)}`,
                '-skip_frame nokey',
                `-i ${this.srcFilePath}`,
                '-vsync 0',
                '-f image2',
                `-vf "fps=${fps} [tmp]; [tmp] scale=-1:${this.keyframeHeight} [out]"`,
                path.join(this.tmpDir, `./${extractOperationID}-%09d.bmp`),
            ].join(' ')
        );

        const files = (await fs.readdir(this.tmpDir)).filter((fileName) => fileName.startsWith(`${extractOperationID}-`)).sort();
        const renamePromises: Promise<void>[] = [];
        for (let i = 0; i < files.length; i++) {
            const timeInMS = startInMS + (i * 1000) / fps;
            const oldFilePath = path.join(this.tmpDir, files[i]);
            const newFilePath = path.join(this.tmpDir, `thumbnail-${timeInMS.toFixed(3)}.bmp`);

            renamePromises.push(fs.rename(oldFilePath, newFilePath));
        }
        await Promise.all(renamePromises);

        await this.reloadFromDirectory();
        this.emit('load');
    }

    private async reloadFromDirectory() {
        const matcher = /thumbnail-(\d+\.\d+)\.bmp/;
        const files = (await fs.readdir(this.tmpDir)).filter((fileName) => fileName.startsWith(`thumbnail-`));

        const records: KeyframeLoaderRecord[] = [];
        for (const file of files) {
            matcher.lastIndex = -1;
            const matchArray = matcher.exec(file);
            if (!matchArray) continue;

            const timeInMS = parseFloat(matchArray[1]);

            records.push({ timeInMS: timeInMS, filePath: path.join(this.tmpDir, file) });
        }

        records.sort((r1, r2) => r1.timeInMS - r2.timeInMS);
        this.records = records;
        this.emit('load');
    }

    private async loadVideoDurationInMS(): Promise<number> {
        const ffprobe = await getFFProbeInfo();

        const { stdout } = await promisify(childProcess.exec)(
            [ffprobe.path, `-i ${this.srcFilePath}`, '-print_format json', '-show_streams'].join(' ')
        );

        // eslint-disable-next-line
        return Math.max(...JSON.parse(stdout).streams.map((s: any) => s.duration)) * 1000;
    }
}
