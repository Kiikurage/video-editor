import * as childProcess from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as tmp from 'tmp';
import { getFFMpegInfo } from '../../ipc/renderer/getFFMepgInfo';
import { AudioObject } from '../../model/objects/AudioObject';
import { ShapeObject } from '../../model/objects/ShapeObject';
import { TextObject } from '../../model/objects/TextObject';
import { ImageObject } from '../../model/objects/ImageObject';
import { VideoObject } from '../../model/objects/VideoObject';
import { Project } from '../../model/Project';
import { assert } from '../util';
import { createAudioObjectFFMpegStream } from './loader/createAudioObjectFFMpegStream';
import { createShapeObjectFFMpegStream } from './loader/createShapeObjectFFMpegStream';
import { createTextFFMpegStream } from './loader/createTextFFMpegStream';
import { createFFMpegStream } from './loader/createFFMpegStream';
import { createImageObjectFFMpegStream } from './loader/createImageObjectFFMpegStream';
import { createVideoObjectFFMpegStream } from './loader/createVideoObjectFFMpegStream';
import { backgroundImageInput } from './stream/FFMpegBackgroundImageInputStream';
import { FFMpegInputStream } from './stream/FFMpegInputStream';
import { FFMpegStream, FFMpegStreamMap } from './stream/FFMpegStream';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FFMpegStreamCreatorMap: Record<string, createFFMpegStream<any>> = {
    [TextObject.type]: createTextFFMpegStream,
    [VideoObject.type]: createVideoObjectFFMpegStream,
    [ImageObject.type]: createImageObjectFFMpegStream,
    [AudioObject.type]: createAudioObjectFFMpegStream,
    [ShapeObject.type]: createShapeObjectFFMpegStream,
};

export async function encodeProject(project: Project, outputVideoPath: string): Promise<void> {
    console.time('encodeProject');
    const { name: workspacePath, removeCallback: cleanUpWorkspace } = tmp.dirSync({ unsafeCleanup: true });
    try {
        // デバッグ用
        await fs.unlink('./tmp');
    } catch {
        // ignored
    } finally {
        await fs.symlink(workspacePath, './tmp');
    }

    // ffmpegでエンコード
    const tmpOutputVideoPath = path.join(workspacePath, './output.mp4');
    await encode(project, tmpOutputVideoPath, workspacePath);

    // 出力動画をコピー
    await fs.copyFile(tmpOutputVideoPath, outputVideoPath);

    // クリーンアップ
    cleanUpWorkspace();
    console.timeEnd('encodeProject');
    console.log('DONE');
}

async function encode(project: Project, outputPath: string, workspacePath: string): Promise<void> {
    const ffmpeg = await getFFMpegInfo();

    let mainStreamMap: FFMpegStreamMap = {
        video: await backgroundImageInput(project, workspacePath),
        audio: null,
    };
    for (const object of project.objects) {
        const ffmpegStreamCreator = FFMpegStreamCreatorMap[object.type];
        if (ffmpegStreamCreator === undefined) {
            assert(false, `Unsupported object type: ${object.type}`);
        }

        mainStreamMap = await ffmpegStreamCreator(object, mainStreamMap, project, workspacePath);
    }
    const inputs = [
        ...new Set(
            Object.values(mainStreamMap)
                .filter((stream: FFMpegStream | null) => stream !== null)
                .map((stream: FFMpegStream) => collectInputs(stream))
                .flat()
        ),
    ];

    const commandParts: string[] = [ffmpeg.path];

    commandParts.push(`-framerate ${project.fps}`);

    for (const input of inputs) {
        if (input.option.loop) {
            commandParts.push('-loop 1');
        }
        commandParts.push(`-i "${input.srcFilePath}"`);
    }

    let filterExpression = buildFilterExpression(mainStreamMap);
    for (let i = 0; i < inputs.length; i++) {
        filterExpression = filterExpression.replace(`[${inputs[i].id}]`, `[${i}:${inputs[i].option.type}]`);
    }
    commandParts.push(`-filter_complex "${filterExpression}"`);

    commandParts.push(`-t ${(Project.computeDurationInMS(project) / 1000).toFixed(3)}`);
    if (mainStreamMap.video) {
        commandParts.push(`-map "[${mainStreamMap.video.id}]"`);
    }
    if (mainStreamMap.audio) {
        commandParts.push(`-map "[${mainStreamMap.audio.id}]"`);
    }
    if (process.platform === 'darwin') {
        commandParts.push(`-c:v h264_videotoolbox`);
    } else {
        commandParts.push(`-c:v libx264`);
    }
    commandParts.push(`-pix_fmt yuv420p`);
    commandParts.push(`-qmin 30`);
    commandParts.push(`-bf 0`);
    commandParts.push(`-b 6000k`);
    commandParts.push(`-g ${project.fps * 5}`);
    commandParts.push(outputPath);

    const command = commandParts.join(' ');

    console.groupCollapsed('FFMPEG command');
    console.log(command);
    console.groupEnd();

    await promisify(childProcess.exec)(command);
}

function buildFilterExpression(streamMap: FFMpegStreamMap): string {
    return Object.values(streamMap)
        .filter((stream: FFMpegStream | null) => stream !== null)
        .map((stream: FFMpegStream) => stream.buildCommand())
        .join('; ');
}

function collectInputs(output: FFMpegStream): FFMpegInputStream[] {
    if (output.parentFilter === null) {
        assert(output instanceof FFMpegInputStream, 'Failed to track input node');
        return [output];
    }

    return [...new Set(output.parentFilter.inputs.map(collectInputs).flat(1))];
}
