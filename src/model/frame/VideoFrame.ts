import { Frame } from './Frame';

export interface VideoFrame extends Frame {
    type: 'VIDEO';
    timeInMS: number;
    duration: number;
    srcFilePath: string;
}
