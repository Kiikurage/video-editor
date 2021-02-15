function isBox(object: unknown): object is Box {
    return typeof object === 'object' && object !== null && 'x' in object && 'y' in object && 'width' in object && 'height' in object;
}

export const Box = {
    isBox,
} as const;

export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}
