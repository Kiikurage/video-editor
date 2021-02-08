import { BaseObject } from './BaseObject';

function isVideo(object: BaseObject): object is VideoObject {
    return object.type === VideoObject.type;
}

export const VideoObject = {
    type: 'VIDEO',
    isVideo,
} as const;

export interface VideoObject extends BaseObject {
    type: typeof VideoObject.type;
    srcFilePath: string;
    x: number;
    y: number;
    width: number;
    height: number;
}
