import * as ffmpeg from '@ffmpeg-installer/ffmpeg';
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { IPCMessages } from './model/IPCMessages';

ipcMain.on(IPCMessages.GET_FFMPEG_INFO, (ev) => {
    ev.returnValue = {
        path: ffmpeg.path,
        version: ffmpeg.version,
    };
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('ready', () => {
    void (async () => {
        const win = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
            },
            width: 1280,
            height: 760,
            show: false,
            // titleBarStyle: 'hiddenInset'
        });

        await win.loadFile(path.resolve(__dirname, './index.html'));

        win.show();
    })();
});
