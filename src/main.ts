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

function createWindow() {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
        },
        width: 1280,
        height: 760,
        show: false,
        // titleBarStyle: 'hiddenInset'
    });

    win.once('ready-to-show', () => win.show());
    void win.loadFile(path.resolve(__dirname, './index.html'));
}

void app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
