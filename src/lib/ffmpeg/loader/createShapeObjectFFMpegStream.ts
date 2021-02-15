import { promises as fs } from 'fs';
import * as path from 'path';
import * as PIXI from 'pixi.js';
import { AnimatableValue } from '../../../model/objects/AnimatableValue';
import { ShapeObject } from '../../../model/objects/ShapeObject';
import { Project } from '../../../model/Project';
import { ShapeObjectViewBehavior } from '../../../view/PreviewPlayer/ShapeObjectView';
import { assert } from '../../util';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { scale } from '../filters/FFMpegScaleFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createShapeObjectFFMpegStream: createFFMpegStream<ShapeObject> = async (
    shape: ShapeObject,
    outputStreamMap: FFMpegStreamMap,
    project: Project,
    workspacePath: string
) => {
    const x = AnimatableValue.interpolate(shape.x, shape.startInMS, shape.endInMS, shape.startInMS);
    const y = AnimatableValue.interpolate(shape.y, shape.startInMS, shape.endInMS, shape.startInMS);
    const width = AnimatableValue.interpolate(shape.width, shape.startInMS, shape.endInMS, shape.startInMS);
    const height = AnimatableValue.interpolate(shape.height, shape.startInMS, shape.endInMS, shape.startInMS);

    const blob = await renderShape(project, shape, shape.startInMS);
    assert(blob !== null, 'Failed to get shape image from canvas');

    const shapeImagePath = path.resolve(workspacePath, `./shape-${shape.id}.png`);
    await fs.writeFile(shapeImagePath, new Uint8Array(await blob.arrayBuffer()));

    let stream = input(shapeImagePath);
    stream = scale(stream, { width: Math.round(width), height: Math.round(height) });

    return {
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: Math.round(x),
                  y: Math.round(y),
                  enable: `between(t,${(shape.startInMS / 1000).toFixed(3)},${(shape.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    };
};

async function renderShape(project: Project, shape: ShapeObject, timeInMS: number): Promise<Blob | null> {
    const width = AnimatableValue.interpolate(shape.width, shape.startInMS, shape.endInMS, timeInMS);
    const height = AnimatableValue.interpolate(shape.height, shape.startInMS, shape.endInMS, timeInMS);
    const fill = AnimatableValue.interpolate(shape.fill, shape.startInMS, shape.endInMS, timeInMS);
    const stroke = AnimatableValue.interpolate(shape.stroke, shape.startInMS, shape.endInMS, timeInMS);

    const app = new PIXI.Application({
        width: width,
        height: height,
        transparent: true,
    });

    const shapeView = ShapeObjectViewBehavior.customDisplayObject({
        shapeType: shape.type,
        width: width,
        height: height,
        fill: fill,
        stroke: stroke,
    });
    app.stage.addChild(shapeView);
    app.render();

    const blob = await new Promise<Blob | null>((resolve) => app.view.toBlob(resolve));

    app.destroy(true);

    return blob;
}
