import { IPCMessage } from '../../model/IPCMessage';
import { IPCRenderer } from '../IPCRenderer';

export function getFFMpegInfo(): Promise<{ path: string; version: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return IPCRenderer.sendMessageAsync(IPCMessage.GET_FFMPEG_INFO);
}
