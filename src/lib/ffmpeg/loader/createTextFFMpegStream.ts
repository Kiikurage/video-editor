import { promises as fs } from 'fs';
import * as path from 'path';
import * as PIXI from 'pixi.js';
import { TextObject } from '../../../model/objects/TextObject';
import { Project } from '../../../model/Project';
import { TextObjectViewBehavior } from '../../../view/pixi/PreviewPlayer/TextObjectView';
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
    const blob = await renderText(project, textObject);
    assert(blob !== null, 'Failed to get text image from canvas');

    const textImagePath = path.resolve(workspacePath, `./text-${textObject.id}.png`);
    await fs.writeFile(textImagePath, new Uint8Array(await blob.arrayBuffer()));

    let stream = input(textImagePath);
    stream = scale(stream, { width: Math.round(textObject.width), height: Math.round(textObject.height) });

    return {
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: Math.round(textObject.x),
                  y: Math.round(textObject.y),
                  enable: `between(t,${(textObject.startInMS / 1000).toFixed(3)},${(textObject.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    };
};

async function renderText(project: Project, textObject: TextObject): Promise<Blob | null> {
    const app = new PIXI.Application({
        width: textObject.width,
        height: textObject.height,
        transparent: true,
    });

    const textView = TextObjectViewBehavior.customDisplayObject(textObject);
    app.stage.addChild(textView);
    app.render();

    const blob = await new Promise<Blob | null>((resolve) => app.view.toBlob(resolve));

    app.destroy(true);

    return blob;
}
