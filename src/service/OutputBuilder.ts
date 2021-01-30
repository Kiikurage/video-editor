import * as childProcess from 'child_process';
import { ipcRenderer } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import { promisify } from 'util';
import { assert } from '../lib/util';
import { CaptionObject } from '../model/CaptionObject';
import { IPCMessages } from '../model/IPCMessages';
import { Project } from '../model/Project';

const LOG_EVENT = new Event('log');

interface OutputBuilderEvents {
    addEventListener(type: 'log', callback: () => void): void;

    removeEventListener(type: 'log', callback: () => void): void;
}

export class OutputBuilder extends EventTarget implements OutputBuilderEvents {
    private inputVideoPath = '';
    private outputVideoPath = '';
    private project: Project | null = null;

    private _log = '';

    get log(): string {
        return this._log;
    }

    static buildFFMpegCommand(inputVideoPath: string, captionImageList: ReadonlyArray<CaptionImage>, outputVideoPath: string): string {
        console.log('build start');
        const command: string[] = [];

        const ffmpeg = ipcRenderer.sendSync(IPCMessages.GET_FFMPEG_INFO) as { path: string; version: string };
        console.log(`FFMPEG path=${ffmpeg.path} version=${ffmpeg.version}`);

        command.push(ffmpeg.path);
        command.push('-ss 00:00:00 -to 00:00:20'); // TODO: Debug only

        command.push(`-i ${inputVideoPath}`);

        for (const captionImage of captionImageList) {
            command.push(`-i ${captionImage.path}`);
        }

        if (captionImageList.length > 0) {
            const filterComplexExpr: string[] = [];

            for (let i = 0; i < captionImageList.length; i++) {
                const captionImage = captionImageList[i];

                const filterInput1 = i === 0 ? '[0]' : '[v]';
                const filterInput2 = `[${i + 1}]`;
                const startTimeInSecond = (captionImage.startInMS / 1000).toFixed(3);
                const endTimeInSecond = (captionImage.endInMS / 1000).toFixed(3);
                const filterOutput = i === captionImageList.length - 1 ? '' : '[v]';

                filterComplexExpr.push(
                    `${filterInput1}${filterInput2}overlay=enable='between(t,${startTimeInSecond},${endTimeInSecond})'${filterOutput}`
                );
            }
            command.push(`-filter_complex "${filterComplexExpr.join('; ')}"`);
        }

        command.push('-c:v h264_videotoolbox');
        command.push('-c:a copy');
        command.push(outputVideoPath);

        return command.join(' ');
    }

    setInputVideoPath(inputVideoPath: string): this {
        this.inputVideoPath = inputVideoPath;
        return this;
    }

    setOutputVideoPath(outputVideoPath: string): this {
        this.outputVideoPath = outputVideoPath;
        return this;
    }

    setProject(project: Project): this {
        this.project = project;
        return this;
    }

    async build(): Promise<void> {
        assert(this.inputVideoPath !== '', 'Input path must be specified!');
        assert(this.project !== null, 'Project must be specified');
        assert(this.outputVideoPath !== '', 'Output path must be specified!');

        this._log = '';

        console.time('OutputBuilder.build()');

        const { name: workspacePath, removeCallback: cleanUpWorkspace } = tmp.dirSync({
            unsafeCleanup: true,
        });

        this.addLog(`workspacePath: ${workspacePath}`);

        // デバッグ用
        try {
            await fs.unlink('./tmp');
        } catch {
            // ignored
        }
        await fs.symlink(workspacePath, './tmp');

        // 入力動画をコピー
        const inputVideoPath = path.join(workspacePath, './input.mp4');
        this.addLog(`Copy input video`);
        this.addLog(`  - src: ${path.resolve(this.inputVideoPath)}`);
        this.addLog(`  - dst: ${inputVideoPath}`);
        await fs.copyFile(this.inputVideoPath, inputVideoPath);

        // 字幕画像を生成
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        assert(ctx !== null, 'Failed to initialize canvas context');

        const captionImageList: CaptionImage[] = [];
        for (let i = 0; i < this.project.objects.length; i++) {
            this.addLog(`Prepare caption image: ${i}`);
            const object = this.project.objects[i];
            assert(CaptionObject.isCaption(object), 'Currently, only CaptionObject is supported');

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            renderCaption(ctx, object);

            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
            assert(blob !== null, 'Failed to get image from canvas');

            const captionImagePath = path.resolve(workspacePath, `./caption-${i}.png`);
            this.addLog(`  - output path: ${captionImagePath}`);

            await fs.writeFile(captionImagePath, new Uint8Array(await blob.arrayBuffer()));

            captionImageList.push({
                path: captionImagePath,
                startInMS: object.startInMS,
                endInMS: object.endInMS,
            });
        }

        // ffmpeg読んで合成
        this.addLog(`Build encode command`);
        const outputVideoPath = path.join(workspacePath, './output.mp4');
        const command = OutputBuilder.buildFFMpegCommand(inputVideoPath, captionImageList, outputVideoPath);
        this.addLog(`  - command: ${command}`);

        this.addLog(`Encode video`);
        console.log(command);
        await promisify(childProcess.exec)(command);

        // 出力動画をコピー
        this.addLog(`Copy output video: ${outputVideoPath}`);
        await fs.copyFile(outputVideoPath, this.outputVideoPath);

        // クリーンアップ
        this.addLog(`Clean up workspace`);
        cleanUpWorkspace();

        this.addLog(`Done`);
        console.timeEnd('OutputBuilder.build()');
    }

    private addLog(newLogLine: string): void {
        this._log += newLogLine + '\n';
        this.dispatchEvent(LOG_EVENT);
    }
}

interface CaptionImage {
    path: string;
    startInMS: number;
    endInMS: number;
}

function renderCaption(ctx: CanvasRenderingContext2D, caption: CaptionObject) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.textAlign = 'center';
    ctx.font = 'bold 80px "Noto Sans JP"';
    ctx.fillStyle = '#aa66ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.fillText(caption.text, width / 2, height - 100, width - 200);
    ctx.strokeText(caption.text, width / 2, height - 100, width - 200);
}
