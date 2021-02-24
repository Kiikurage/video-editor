import { HorizontalAlign, VerticalAlign } from '../objects/TextObject';
import { Frame } from './Frame';

export interface TextFrame extends Frame {
    type: 'TEXT';
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fill: number;
    stroke: number;
    strokeThickness: number;
    horizontalAlign: HorizontalAlign;
    verticalAlign: VerticalAlign;
}
