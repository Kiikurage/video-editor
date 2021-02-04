import { SaveDialogReturnValue } from 'electron';
import { IPCMessage } from '../../model/IPCMessage';
import { IPCRenderer } from '../IPCRenderer';

export function showSaveFileDialog(): Promise<SaveDialogReturnValue> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return IPCRenderer.sendMessageAsync(IPCMessage.SHOW_SAVE_FILE_DIALOG);
}
