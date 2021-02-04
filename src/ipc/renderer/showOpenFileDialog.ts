import { OpenDialogReturnValue } from 'electron';
import { IPCMessage } from '../../model/IPCMessage';
import { IPCRenderer } from '../IPCRenderer';

export function showOpenFileDialog(): Promise<OpenDialogReturnValue> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return IPCRenderer.sendMessageAsync(IPCMessage.SHOW_OPEN_FILE_DIALOG);
}
