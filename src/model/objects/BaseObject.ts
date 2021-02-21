import { UUID } from '../../lib/UUID';

export interface BaseObject {
    readonly type: string;
    readonly id: string;
    readonly startInMS: number;
    readonly endInMS: number;
    readonly locked: boolean;
}

interface ObjectBehaviorDescriptor<T extends BaseObject = BaseObject> {
    type: T['type'];
    serialize: (object: T) => string;
    deserialize: (str: string) => T;
    clone: (src: T) => T;
}

const ObjectBehaviorMap = new Map<string, ObjectBehaviorDescriptor>();

const DefaultBehavior: Partial<ObjectBehaviorDescriptor> = {
    serialize: (object) => JSON.stringify(object),
    deserialize: (str) => JSON.parse(str) as never,
    clone: (src) => ({ ...BaseObject.deserialize(BaseObject.serialize(src)), id: UUID() }),
};

function register(behavior: Partial<ObjectBehaviorDescriptor> & Pick<ObjectBehaviorDescriptor, 'type'>): void {
    ObjectBehaviorMap.set(behavior.type, { ...DefaultBehavior, ...behavior } as ObjectBehaviorDescriptor);
}

function serialize(object: BaseObject): string {
    const descriptor = ObjectBehaviorMap.get(object.type);
    if (!descriptor) {
        throw new Error(`Unknown object type: ${object.type}`);
    }

    return descriptor.serialize(object);
}

function deserialize(str: string): BaseObject {
    let type: string;
    try {
        type = (JSON.parse(str) as BaseObject).type;
    } catch (e) {
        throw new Error(`Failed to parse object type`);
    }

    const descriptor = ObjectBehaviorMap.get(type);
    if (!descriptor) {
        throw new Error(`Unknown object type: ${type}`);
    }

    return descriptor.deserialize(str);
}

function clone<T extends BaseObject>(object: T): T {
    const descriptor = ObjectBehaviorMap.get(object.type);
    if (!descriptor) {
        throw new Error(`Unknown object type: ${object.type}`);
    }

    return descriptor.clone(object as never) as T;
}

export const BaseObject = { register, serialize, deserialize, clone } as const;
