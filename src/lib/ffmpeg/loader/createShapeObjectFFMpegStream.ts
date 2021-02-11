import { promises as fs } from 'fs';
import * as path from 'path';
import * as PIXI from 'pixi.js';
import { ShapeObject } from '../../../model/objects/ShapeObject';
import { Project } from '../../../model/Project';
import { ShapeObjectViewBehavior } from '../../../view/pixi/PreviewPlayer/ShapeObjectView';
import { assert } from '../../util';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { scale } from '../filters/FFMpegScaleFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createShapeObjectFFMpegStream: createFFMpegStream<ShapeObject> = async (
    shapeObject: ShapeObject,
    outputStreamMap: FFMpegStreamMap,
    project: Project,
    workspacePath: string
) => {
    const blob = await renderShape(project, shapeObject);
    assert(blob !== null, 'Failed to get shape image from canvas');

    const shapeImagePath = path.resolve(workspacePath, `./shape-${shapeObject.id}.png`);
    await fs.writeFile(shapeImagePath, new Uint8Array(await blob.arrayBuffer()));

    let stream = input(shapeImagePath);
    stream = scale(stream, { width: Math.round(shapeObject.width), height: Math.round(shapeObject.height) });

    return {
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: Math.round(shapeObject.x),
                  y: Math.round(shapeObject.y),
                  enable: `between(t,${(shapeObject.startInMS / 1000).toFixed(3)},${(shapeObject.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    };
};

async function renderShape(project: Project, shapeObject: ShapeObject): Promise<Blob | null> {
    const app = new PIXI.Application({
        width: shapeObject.width,
        height: shapeObject.height,
        transparent: true,
    });

    const shapeView = ShapeObjectViewBehavior.customDisplayObject({ shape: shapeObject });
    app.stage.addChild(shapeView);
    app.render();

    const blob = await new Promise<Blob | null>((resolve) => app.view.toBlob(resolve));

    app.destroy(true);

    return blob;
}
