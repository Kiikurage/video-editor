import { Frame } from './Frame';

export interface AudioFrame extends Frame {
    type: 'AUDIO';
    timeInMS: number;
    duration: number;
    srcFilePath: string;
    volume: number;
    x: 0;
    y: 0;
    width: 0;
    height: 0;
}
