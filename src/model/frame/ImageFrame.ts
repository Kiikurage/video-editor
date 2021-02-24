import { Frame } from './Frame';

export interface ImageFrame extends Frame {
    type: 'IMAGE';
    srcFilePath: string;
}
