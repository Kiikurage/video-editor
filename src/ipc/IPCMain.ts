import { ipcMain, IpcMainEvent } from 'electron';
import { IPCMessage } from '../model/IPCMessage';

export const IPCMain = {
    onMessage<REQ, RES>(channel: string, handler: (ev: IpcMainEvent, request: REQ) => Promise<RES> | RES): void {
        ipcMain.on(channel, (ev, request: IPCMessage<REQ>) => {
            const { receiverChannel, data } = request;

            void (async () => {
                const responseData = await handler(ev, data);

                console.log(`Main -> Renderer: ${receiverChannel}`);
                ev.reply(receiverChannel, responseData);
            })();
        });
    },
};
