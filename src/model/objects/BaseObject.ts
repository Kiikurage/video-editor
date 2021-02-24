import { UUID } from '../../lib/UUID';
import { Frame } from '../frame/Frame';

export interface BaseObjectProps {
    id?: string;
    startInMS?: number;
    endInMS?: number;
    locked?: boolean;
}

export abstract class BaseObject {
    readonly id: string;
    readonly startInMS: number;
    readonly endInMS: number;
    readonly locked: boolean;

    constructor(data: BaseObjectProps) {
        this.id = data.id ?? UUID();
        this.startInMS = data.startInMS ?? 0;
        this.endInMS = data.endInMS ?? 5000;
        this.locked = data.locked ?? false;
    }

    abstract serialize(): string;

    abstract getFrame(currentTimeInMS: number): Frame;

    abstract clone(data?: Partial<BaseObjectProps>): BaseObject;
}
