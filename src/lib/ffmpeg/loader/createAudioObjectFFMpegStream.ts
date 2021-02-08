import { VideoObject } from '../../../model/objects/VideoObject';
import { atrim } from '../filters/FFMpegATrimFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createAudioObjectFFMpegStream: createFFMpegStream<VideoObject> = (audio: VideoObject, outputStreamMap: FFMpegStreamMap) => {
    let stream = input(audio.srcFilePath, { type: 'a' });
    stream = atrim(stream, { startInSecond: audio.startInMS / 1000, endInSecond: audio.endInMS / 1000 });

    return Promise.resolve({
        ...outputStreamMap,

        // TODO: 合成
        audio: stream,
    });
};
