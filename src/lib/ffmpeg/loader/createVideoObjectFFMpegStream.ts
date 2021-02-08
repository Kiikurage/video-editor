import { VideoObject } from '../../../model/objects/VideoObject';
import { overlay } from '../filters/FFMpegOverlayFilter';
import { scale } from '../filters/FFMpegScaleFilter';
import { trim } from '../filters/FFMpegTrimFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createVideoObjectFFMpegStream: createFFMpegStream<VideoObject> = (video: VideoObject, outputStreamMap: FFMpegStreamMap) => {
    let stream = input(video.srcFilePath);
    stream = trim(stream, { startInSecond: video.startInMS / 1000, endInSecond: video.endInMS / 1000 });
    stream = scale(stream, { width: Math.round(video.width), height: Math.round(video.height) });

    return Promise.resolve({
        ...outputStreamMap,
        video: outputStreamMap.video
            ? overlay(outputStreamMap.video, stream, {
                  x: Math.round(video.x),
                  y: Math.round(video.y),
                  enable: `between(t,${(video.startInMS / 1000).toFixed(3)},${(video.endInMS / 1000).toFixed(3)})`,
              })
            : stream,
    });
};
