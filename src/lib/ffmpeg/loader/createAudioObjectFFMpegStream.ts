import { AudioObject } from '../../../model/objects/AudioObject';
import { atrim } from '../filters/FFMpegATrimFilter';
import { volume } from '../filters/FFMpegVolumeFilter';
import { input } from '../stream/FFMpegInputStream';
import { FFMpegStreamMap } from '../stream/FFMpegStream';
import { createFFMpegStream } from './createFFMpegStream';

export const createAudioObjectFFMpegStream: createFFMpegStream<AudioObject> = (audio: AudioObject, outputStreamMap: FFMpegStreamMap) => {
    let stream = input(audio.srcFilePath, { type: 'a' });
    stream = atrim(stream, { startInSecond: audio.startInMS / 1000, endInSecond: audio.endInMS / 1000 });
    stream = volume(stream, { volume: audio.volume });

    return Promise.resolve({
        ...outputStreamMap,

        // TODO: 合成
        audio: stream,
    });
};
