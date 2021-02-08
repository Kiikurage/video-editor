import { ImageObject } from '../../../model/objects/ImageObject';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { scale } from '../filters/FFMpegScaleFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createImageObjectFFMpegStream: createFFMpegStream<ImageObject> = (image: ImageObject, outputStreamMap: FFMpegStreamMap) => {
    let stream = input(image.srcFilePath);
    stream = scale(stream, { width: Math.round(image.width), height: Math.round(image.height) });

    return Promise.resolve({
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: Math.round(image.x),
                  y: Math.round(image.y),
                  enable: `between(t,${(image.startInMS / 1000).toFixed(3)},${(image.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    });
};
