import { BaseObject } from './BaseObject';

function isAudio(object: BaseObject): object is AudioObject {
    return object.type === AudioObject.type;
}

export const AudioObject = {
    type: 'AUDIO',
    isAudio,
} as const;

export interface AudioObject extends BaseObject {
    type: typeof AudioObject.type;
    srcFilePath: string;
    volume: number;
}
