import * as childProcess from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as PIXI from 'pixi.js';
import { promisify } from 'util';
import { ShapeObject } from '../../../model/objects/ShapeObject';
import { Project } from '../../../model/Project';
import { ShapeObjectViewBehavior } from '../../../view/pixi/PreviewPlayer/ShapeObjectView';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createShapeObjectFFMpegStream: createFFMpegStream<ShapeObject> = async (
    shapeObject: ShapeObject,
    outputStreamMap: FFMpegStreamMap,
    project: Project,
    workspacePath: string
) => {
    const videoPaths: string[] = [];

    const app = new PIXI.Application({
        width: project.viewport.width,
        height: project.viewport.height,
        transparent: true,
        resolution: 1,
        autoDensity: false,
        antialias: true,
    });

    const BATCH_SIZE = 60;
    let startFrame = Math.round((shapeObject.startInMS * project.fps) / 1000);
    const endFrame = Math.round((shapeObject.endInMS * project.fps) / 1000);
    while (startFrame < endFrame) {
        const batchStartFrame = startFrame;
        const batchEndFrame = Math.min(endFrame, startFrame + BATCH_SIZE);
        const numFrame = batchEndFrame - batchStartFrame;

        const tmpVideoPath = path.resolve(workspacePath, `./shape-${shapeObject.id}-${videoPaths.length}.mov`);
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

        for (let frame = 0; frame < numFrame; frame++) {
            const timeInMS = shapeObject.startInMS * (1 - frame / endFrame) + (shapeObject.endInMS * frame) / endFrame;
            const buffer = new Buffer(renderFrame(app, project, shapeObject, timeInMS));
            await new Promise((r) => ffmpegProcess.stdin.write(buffer, r));
        }
        await new Promise((r) => ffmpegProcess.stdin.end(r));

        videoPaths.push(tmpVideoPath);
        startFrame += BATCH_SIZE;
    }

    const concatFileListPath = path.resolve(workspacePath, `./concat-shape-${shapeObject.id}.txt`);
    await fs.writeFile(concatFileListPath, videoPaths.map((videoPath) => `file ${videoPath}`).join('\n'), 'utf-8');

    const tmpVideoPath = path.resolve(workspacePath, `./concat-shape-${shapeObject.id}.mov`);
    await promisify(childProcess.exec)(
        [['ffmpeg'], ['-f', 'concat'], ['-safe', '0'], ['-i', concatFileListPath], ['-an'], ['-vcodec', 'copy'], [tmpVideoPath]]
            .flat()
            .join(' ')
    );

    const stream = input(tmpVideoPath);

    const outputVideoStream = outputStreamMap.video;

    return {
        ...outputStreamMap,
        video: outputVideoStream
            ? overlay(outputVideoStream, stream, {
                  x: 0,
                  y: 0,
                  enable: `between(t,${(shapeObject.startInMS / 1000).toFixed(3)},${(shapeObject.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    };
};

const BYTE_PER_PIXEL = 4; // RGBA

function renderFrame(app: PIXI.Application, project: Project, shapeObject: ShapeObject, _timeInMS: number): ArrayBuffer {
    const shapeView = ShapeObjectViewBehavior.customDisplayObject({ shape: shapeObject });
    shapeView.x = shapeObject.x;
    shapeView.y = shapeObject.y;

    app.stage.removeChildren(0, app.stage.children.length);
    app.stage.addChild(shapeView);
    app.render();

    const buffer = new Uint8Array(project.viewport.width * project.viewport.height * BYTE_PER_PIXEL);
    app.renderer.gl.readPixels(
        0,
        0,
        project.viewport.width,
        project.viewport.height,
        WebGLRenderingContext.RGBA,
        WebGLRenderingContext.UNSIGNED_BYTE,
        buffer
    );

    return buffer;
}
