import { BaseObject } from './BaseObject';

export interface Project {
    /**
     * @deprecated
     */
    inputVideoPath?: string;
    viewport: {
        width: number;
        height: number;
    };
    objects: BaseObject[];
}
