import * as childProcess from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { getFFMpegInfo } from '../../../ipc/renderer/getFFMepgInfo';
import { BaseObject } from '../../../model/objects/BaseObject';
import { Project } from '../../../model/Project';
import { PreviewCanvasViewportInfo } from '../../../view/PreviewPlayer/PreviewPlayer';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStream } from '../stream/FFMpegStream';
import { renderObject } from './util';

export async function createFrameObjectFFMpegStream<T extends BaseObject>(
    object: T,
    displayObjectFactory: (props: { object: T; timeInMS: number; canvasContext: PreviewCanvasViewportInfo }) => PIXI.DisplayObject,
    project: Project,
    workspacePath: string
): Promise<FFMpegStream> {
    const { path: ffmpegPath } = await getFFMpegInfo();
    const startFrame = Math.round((object.startInMS * project.fps) / 1000);
    const endFrame = Math.round((object.endInMS * project.fps) / 1000);

    let batchId = 0;
    const batchSize = 2;
    const batchVideoPath: string[] = [];

    for (let batchStartFrame = startFrame; batchStartFrame < endFrame; batchStartFrame += batchSize) {
        const canvasContext: PreviewCanvasViewportInfo = { scale: 1, left: 0, top: 0 };
        const batchEndFrame = Math.min(batchStartFrame + batchSize, endFrame);
        const buffers: Buffer[] = [];
        for (let frame = batchStartFrame; frame < batchEndFrame; frame++) {
            const timing = (frame - startFrame) / (endFrame - startFrame);
            const timeInMS = object.startInMS * (1 - timing) + object.endInMS * timing;

            const displayObject = displayObjectFactory({ object, timeInMS, canvasContext });
            const arrayBuffer = renderObject(project, displayObject);
            const buffer = new Buffer(arrayBuffer);
            buffers.push(buffer);
        }

        const tmpVideoPath = path.resolve(workspacePath, `./createFrameObjectFFMpegStream-${object.id}-${batchId}.mov`);
        const ffmpegProcess = childProcess.spawn(
            ffmpegPath,
            [
                ['-y'],
                ['-f', 'rawvideo'],
                ['-s', `${project.viewport.width}x${project.viewport.height}`],
                ['-pix_fmt', 'rgba'],
                ['-r', `${project.fps}`],
                ['-i', '-'],
                ['-vf', 'vflip'],
                ['-an'],
                ['-vcodec', 'qtrle'],
                [tmpVideoPath],
            ].flat(),
            {
                stdio: ['pipe', null, null],
            }
        );
        for (const buffer of buffers) {
            await new Promise((r) => ffmpegProcess.stdin.write(buffer, r));
        }
        await new Promise((r) => ffmpegProcess.stdin.end(r));

        batchVideoPath.push(tmpVideoPath);
        batchId++;
    }

    const batchVideoListData = batchVideoPath.map((videoPath) => `file ${videoPath}`).join('\n');
    const batchVideoListFilePath = path.resolve(workspacePath, `./createFrameObjectFFMpegStream-${object.id}-concat.txt`);
    await fs.writeFile(batchVideoListFilePath, batchVideoListData, 'utf-8');
    const tmpVideoPath = path.resolve(workspacePath, `./createFrameObjectFFMpegStream-${object.id}.mov`);

    await promisify(childProcess.exec)(
        [ffmpegPath, ['-y'], ['-f', 'concat'], ['-safe', '0'], ['-i', batchVideoListFilePath], ['-c', 'copy'], [tmpVideoPath]]
            .flat()
            .join(' ')
    );
    console.timeEnd(`${object.id} batch concat`);

    return input(tmpVideoPath);
}
