import { ImageObject } from '../../../model/objects/ImageObject';
import { Project } from '../../../model/Project';
import { ImageObjectViewRenderer } from '../../../view/Renderer/ImageObjectViewRenderer';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';
import { createFrameObjectFFMpegStream } from './createFrameBasedObjectFFMpegStream';

export const createImageObjectFFMpegStream: createFFMpegStream<ImageObject> = async (
    image: ImageObject,
    outputStreamMap: FFMpegStreamMap,
    project: Project,
    workspacePath: string
) => {
    const stream = await createFrameObjectFFMpegStream(image, ImageObjectViewRenderer.customDisplayObject, project, workspacePath);

    return Promise.resolve({
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: 0,
                  y: 0,
                  enable: `between(t,${(image.startInMS / 1000).toFixed(3)},${(image.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    });
};
