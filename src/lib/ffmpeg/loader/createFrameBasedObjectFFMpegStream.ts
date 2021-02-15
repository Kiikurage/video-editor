import * as childProcess from 'child_process';
import * as path from 'path';
import { BaseObject } from '../../../model/objects/BaseObject';
import { Project } from '../../../model/Project';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStream } from '../stream/FFMpegStream';
import { renderObject } from './util';

export async function createFrameObjectFFMpegStream<T extends BaseObject>(
    object: T,
    displayObjectFactory: (props: { object: T; timeInMS: number }) => PIXI.DisplayObject,
    project: Project,
    workspacePath: string
): Promise<FFMpegStream> {
    const startFrame = Math.round((object.startInMS * project.fps) / 1000);
    const endFrame = Math.round((object.endInMS * project.fps) / 1000);
    const tmpVideoPath = path.resolve(workspacePath, `./concat-shape-${object.id}.mov`);
    const ffmpegProcess = childProcess.spawn(
        'ffmpeg',
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
    ffmpegProcess.stderr.on('data', (data: string) => {
        console.log(`FFMPEG stderr: ${data}`);
    });

    for (let frame = startFrame; frame < endFrame; frame++) {
        const timing = (frame - startFrame) / (endFrame - startFrame);
        const timeInMS = object.startInMS * (1 - timing) + object.endInMS * timing;

        const displayObject = displayObjectFactory({ object, timeInMS });
        const arrayBuffer = renderObject(project, displayObject);
        const buffer = new Buffer(arrayBuffer);

        await new Promise((r) => setTimeout(r, 100));
        await new Promise((r) => ffmpegProcess.stdin.write(buffer, r));
    }
    await new Promise((r) => ffmpegProcess.stdin.end(r));

    return input(tmpVideoPath);
}
