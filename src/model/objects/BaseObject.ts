export interface BaseObject {
    type: string;
    id: string;
    startInMS: number;
    endInMS: number;
    locked: boolean;
}
