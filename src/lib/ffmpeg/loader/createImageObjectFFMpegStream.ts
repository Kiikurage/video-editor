import { AnimatableValue } from '../../../model/objects/AnimatableValue';
import { ImageObject } from '../../../model/objects/ImageObject';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { scale } from '../filters/FFMpegScaleFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createImageObjectFFMpegStream: createFFMpegStream<ImageObject> = (image: ImageObject, outputStreamMap: FFMpegStreamMap) => {
    let stream = input(image.srcFilePath);
    stream = scale(stream, {
        width: Math.round(AnimatableValue.interpolate(image.width, image.startInMS, image.endInMS, image.startInMS)),
        height: Math.round(AnimatableValue.interpolate(image.height, image.startInMS, image.endInMS, image.startInMS)),
    });

    return Promise.resolve({
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: Math.round(AnimatableValue.interpolate(image.x, image.startInMS, image.endInMS, image.startInMS)),
                  y: Math.round(AnimatableValue.interpolate(image.y, image.startInMS, image.endInMS, image.startInMS)),
                  enable: `between(t,${(image.startInMS / 1000).toFixed(3)},${(image.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    });
};
