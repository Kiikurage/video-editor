export type HorizontalAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'center' | 'bottom';

export interface FontStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fill: number;
    stroke: number;
    strokeThickness: number;
    horizontalAlign: HorizontalAlign;
    verticalAlign: VerticalAlign;
}
