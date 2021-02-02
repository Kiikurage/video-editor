import { BaseObject } from './objects/BaseObject';

export interface Project {
    viewport: {
        width: number;
        height: number;
    };
    objects: BaseObject[];
}
