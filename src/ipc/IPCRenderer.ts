/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { UUID } from '../lib/UUID';

export const IPCRenderer = {
    sendMessageAsync<REQ>(channel: string, requestData?: REQ): Promise<any> {
        const receiverChannel = `${channel}:${UUID()}`;

        return new Promise((resolve) => {
            ipcRenderer.once(receiverChannel, (_ev: IpcRendererEvent, response: any) => {
                resolve(response);
            });

            console.log(`Renderer -> Main: ${channel}`);
            ipcRenderer.send(channel, { receiverChannel, data: requestData });
        });
    },
};
