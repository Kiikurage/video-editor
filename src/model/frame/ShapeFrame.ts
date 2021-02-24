import { Frame } from './Frame';

export interface ShapeFrame extends Frame {
    type: 'SHAPE';
    shapeType: string;
    fill: number;
    stroke: number;
}
