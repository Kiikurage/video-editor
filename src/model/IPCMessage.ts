export interface IPCMessage<T> {
    receiverChannel: string;
    data: T;
}

export const IPCMessage = {
    GET_FFMPEG_INFO: 'GET_FFMPEG_INFO',
    GET_FFPROBE_INFO: 'GET_FFPROBE_INFO',
    SHOW_SAVE_FILE_DIALOG: 'SHOW_SAVE_FILE_DIALOG',
    SHOW_OPEN_FILE_DIALOG: 'SHOW_OPEN_FILE_DIALOG',
};
