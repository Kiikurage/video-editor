export const RESIZER_SIZE = 40;

export const DIR: {
    name: string;
    cursor: string;
    dirX: -1 | 0 | 1;
    dirY: -1 | 0 | 1;
}[] = [
    { name: 'nwResizer', cursor: 'nwse-resize', dirX: -1, dirY: -1 },
    { name: 'nResizer', cursor: 'ns-resize', dirX: 0, dirY: -1 },
    { name: 'neResizer', cursor: 'nesw-resize', dirX: 1, dirY: -1 },
    { name: 'wResizer', cursor: 'ew-resize', dirX: -1, dirY: 0 },
    { name: 'eResizer', cursor: 'ew-resize', dirX: 1, dirY: 0 },
    { name: 'swResizer', cursor: 'nesw-resize', dirX: -1, dirY: 1 },
    { name: 'sResizer', cursor: 'ns-resize', dirX: 0, dirY: 1 },
    { name: 'seResizer', cursor: 'nwse-resize', dirX: 1, dirY: 1 },
];
