import { Caption } from './Caption';

export interface Project {
    inputVideoPath?: string;
    captions: Caption[];
}
