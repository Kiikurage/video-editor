import { ShapeObject } from '../../../model/objects/ShapeObject';
import { Project } from '../../../model/Project';
import { ShapeObjectViewRenderer } from '../../../view/Renderer/ShapeObjectViewRenderer';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';
import { createFrameObjectFFMpegStream } from './createFrameBasedObjectFFMpegStream';

export const createShapeObjectFFMpegStream: createFFMpegStream<ShapeObject> = async (
    shapeObject: ShapeObject,
    outputStreamMap: FFMpegStreamMap,
    project: Project,
    workspacePath: string
) => {
    const stream = await createFrameObjectFFMpegStream(shapeObject, ShapeObjectViewRenderer.customDisplayObject, project, workspacePath);

    return {
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: 0,
                  y: 0,
                  enable: `between(t,${(shapeObject.startInMS / 1000).toFixed(3)},${(shapeObject.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    };
};
