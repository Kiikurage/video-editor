import { promises as fs } from 'fs';
import * as path from 'path';
import * as PIXI from 'pixi.js';
import { CaptionObject } from '../../../model/objects/CaptionObject';
import { Project } from '../../../model/Project';
import { CaptionObjectViewBehavior } from '../../../view/pixi/PreviewPlayer/CaptionObjectView';
import { assert } from '../../util';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { scale } from '../filters/FFMpegScaleFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createCaptionObjectFFMpegStream: createFFMpegStream<CaptionObject> = async (
    caption: CaptionObject,
    outputStreamMap: FFMpegStreamMap,
    project: Project,
    workspacePath: string
) => {
    const blob = await renderCaption(project, caption);
    assert(blob !== null, 'Failed to get caption image from canvas');

    const captionImagePath = path.resolve(workspacePath, `./caption-${caption.id}.png`);
    await fs.writeFile(captionImagePath, new Uint8Array(await blob.arrayBuffer()));

    let stream = input(captionImagePath);
    stream = scale(stream, { width: Math.round(caption.width), height: Math.round(caption.height) });

    return {
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: Math.round(caption.x),
                  y: Math.round(caption.y),
                  enable: `between(t,${(caption.startInMS / 1000).toFixed(3)},${(caption.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    };
};

async function renderCaption(project: Project, caption: CaptionObject): Promise<Blob | null> {
    const app = new PIXI.Application({
        width: caption.width,
        height: caption.height,
        transparent: true,
    });

    const captionView = CaptionObjectViewBehavior.customDisplayObject(caption);
    app.stage.addChild(captionView);
    app.render();

    const blob = await new Promise<Blob | null>((resolve) => app.view.toBlob(resolve));

    app.destroy(true);

    return blob;
}
