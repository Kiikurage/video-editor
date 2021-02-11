import { BaseObject } from '../../../../model/objects/BaseObject';

export interface ResizableObject extends BaseObject {
    x: number;
    y: number;
    width: number;
    height: number;
}
