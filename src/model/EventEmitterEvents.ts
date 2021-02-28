import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';

export type TypedEventEmitter<R> = { new (): StrictEventEmitter<EventEmitter, R> };
