import { FFMpegInfo } from '@ffmpeg-installer/ffmpeg';
import { IPCMessage } from '../../model/IPCMessage';
import { IPCRenderer } from '../IPCRenderer';

let CachedResult: Promise<FFMpegInfo>;

export async function getFFMpegInfo(): Promise<FFMpegInfo> {
    if (CachedResult === undefined) {
        CachedResult = IPCRenderer.sendMessageAsync(IPCMessage.GET_FFMPEG_INFO) as Promise<FFMpegInfo>;
    }
    return CachedResult;
}
