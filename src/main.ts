import * as path from 'path';
import * as ffmpeg from '@ffmpeg-installer/ffmpeg';
import * as ffprobe from '@ffprobe-installer/ffprobe';
import { app, BrowserWindow, dialog } from 'electron';
import { assert } from './lib/util';
import { IPCMain } from './ipc/IPCMain';
import { IPCMessage } from './model/IPCMessage';

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

IPCMain.onMessage(IPCMessage.GET_FFMPEG_INFO, () => ({
    path: ffmpeg.path,
    version: ffmpeg.version,
}));

IPCMain.onMessage(IPCMessage.GET_FFPROBE_INFO, () => ({
    path: ffprobe.path,
    version: ffprobe.version,
}));

IPCMain.onMessage(IPCMessage.SHOW_SAVE_FILE_DIALOG, async (ev) => {
    const browserWindow = BrowserWindow.fromWebContents(ev.sender);
    assert(browserWindow !== null, 'Application not found');

    return await dialog.showSaveDialog(browserWindow, {});
});

IPCMain.onMessage(IPCMessage.SHOW_OPEN_FILE_DIALOG, async (ev) => {
    const browserWindow = BrowserWindow.fromWebContents(ev.sender);
    assert(browserWindow !== null, 'Application not found');

    return await dialog.showOpenDialog(browserWindow, {});
});
