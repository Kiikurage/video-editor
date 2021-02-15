import { AnimatableValue } from '../../../model/objects/AnimatableValue';
import { VideoObject } from '../../../model/objects/VideoObject';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { scale } from '../filters/FFMpegScaleFilter';
import { trim } from '../filters/FFMpegTrimFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createVideoObjectFFMpegStream: createFFMpegStream<VideoObject> = (video: VideoObject, outputStreamMap: FFMpegStreamMap) => {
    const x = AnimatableValue.interpolate(video.x, video.startInMS, video.endInMS, video.startInMS);
    const y = AnimatableValue.interpolate(video.y, video.startInMS, video.endInMS, video.startInMS);
    const width = AnimatableValue.interpolate(video.width, video.startInMS, video.endInMS, video.startInMS);
    const height = AnimatableValue.interpolate(video.height, video.startInMS, video.endInMS, video.startInMS);

    let stream = input(video.srcFilePath);
    stream = trim(stream, { startInSecond: video.startInMS / 1000, endInSecond: video.endInMS / 1000 });
    stream = scale(stream, { width: Math.round(width), height: Math.round(height) });

    return Promise.resolve({
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: Math.round(x),
                  y: Math.round(y),
                  enable: `between(t,${(video.startInMS / 1000).toFixed(3)},${(video.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    });
};
