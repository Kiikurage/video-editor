import { NumericAnimatableValue } from './AnimatableValue';
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
    x: NumericAnimatableValue;
    y: NumericAnimatableValue;
    width: NumericAnimatableValue;
    height: NumericAnimatableValue;
}

BaseObject.register({ type: VideoObject.type });
