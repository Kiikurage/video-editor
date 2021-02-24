import { BaseObject } from './BaseObject';

function parse<T extends BaseObject>(_text: string): T {
    throw new Error('NIY');
}

export const ObjectParser = { parse };
