import { FFProbeInfo } from '@ffprobe-installer/ffprobe';
import { IPCMessage } from '../../model/IPCMessage';
import { IPCRenderer } from '../IPCRenderer';

let CachedResult: Promise<FFProbeInfo>;

export function getFFProbeInfo(): Promise<FFProbeInfo> {
    if (CachedResult === undefined) {
        CachedResult = IPCRenderer.sendMessageAsync(IPCMessage.GET_FFPROBE_INFO) as Promise<FFProbeInfo>;
    }
    return CachedResult;
}
