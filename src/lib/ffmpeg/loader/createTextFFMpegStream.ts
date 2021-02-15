import { promises as fs } from 'fs';
import * as path from 'path';
import * as PIXI from 'pixi.js';
import { AnimatableValue } from '../../../model/objects/AnimatableValue';
import { TextObject } from '../../../model/objects/TextObject';
import { Project } from '../../../model/Project';
import { TextObjectViewBehavior } from '../../../view/PreviewPlayer/TextObjectView';
import { assert } from '../../util';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { scale } from '../filters/FFMpegScaleFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createTextFFMpegStream: createFFMpegStream<TextObject> = async (
    textObject: TextObject,
    outputStreamMap: FFMpegStreamMap,
    project: Project,
    workspacePath: string
) => {
    const x = AnimatableValue.interpolate(textObject.x, textObject.startInMS, textObject.endInMS, textObject.startInMS);
    const y = AnimatableValue.interpolate(textObject.y, textObject.startInMS, textObject.endInMS, textObject.startInMS);
    const width = AnimatableValue.interpolate(textObject.width, textObject.startInMS, textObject.endInMS, textObject.startInMS);
    const height = AnimatableValue.interpolate(textObject.height, textObject.startInMS, textObject.endInMS, textObject.startInMS);

    const blob = await renderText(project, textObject, textObject.startInMS);
    assert(blob !== null, 'Failed to get text image from canvas');

    const textImagePath = path.resolve(workspacePath, `./text-${textObject.id}.png`);
    await fs.writeFile(textImagePath, new Uint8Array(await blob.arrayBuffer()));

    let stream = input(textImagePath);
    stream = scale(stream, { width: Math.round(width), height: Math.round(height) });

    return {
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: Math.round(x),
                  y: Math.round(y),
                  enable: `between(t,${(textObject.startInMS / 1000).toFixed(3)},${(textObject.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    };
};

async function renderText(project: Project, textObject: TextObject, timeInMS: number): Promise<Blob | null> {
    const width = AnimatableValue.interpolate(textObject.width, textObject.startInMS, textObject.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(textObject.height, textObject.startInMS, textObject.endInMS, timeInMS);

    const app = new PIXI.Application({
        width: width,
        height: height,
        transparent: true,
    });

    const textView = TextObjectViewBehavior.customDisplayObject({
        object: textObject,
        width: width,
        height: height,
    });
    app.stage.addChild(textView);
    app.render();

    const blob = await new Promise<Blob | null>((resolve) => app.view.toBlob(resolve));

    app.destroy(true);

    return blob;
}
