import { TextObject } from '../../../model/objects/TextObject';
import { Project } from '../../../model/Project';
import { TextObjectViewRenderer } from '../../../view/Renderer/TextObjectViewRenderer';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';
import { createFrameObjectFFMpegStream } from './createFrameBasedObjectFFMpegStream';

export const createTextFFMpegStream: createFFMpegStream<TextObject> = async (
    textObject: TextObject,
    outputStreamMap: FFMpegStreamMap,
    project: Project,
    workspacePath: string
) => {
    const stream = await createFrameObjectFFMpegStream(textObject, TextObjectViewRenderer.customDisplayObject, project, workspacePath);

    return {
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: 0,
                  y: 0,
                  enable: `between(t,${(textObject.startInMS / 1000).toFixed(3)},${(textObject.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    };
};
