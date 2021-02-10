import { Counter } from '../lib/Counter';
import { EventEmitterEvents } from '../model/EventEmitterEvents';
import { EventEmitter } from 'events';

export type SnackBarMessageType = 'info' | 'success' | 'error';

export interface SnackBarMessage {
    type: SnackBarMessageType;
    id: number;
    text: string;
    clearAfterInMS: number;
}

type SnackBarControllerEvents = EventEmitterEvents<{
    change: void;
}>;

export class SnackBarController extends EventEmitter implements SnackBarControllerEvents {
    private static instance: SnackBarController | null = null;
    private readonly messages: SnackBarMessage[] = [];
    private readonly counter: Counter = new Counter();

    static getMessages(): SnackBarMessage[] {
        return SnackBarController.getInstance().getMessages();
    }

    static showMessage = (text: string, option: { type?: SnackBarMessageType; clearAfterInMS?: number } = {}): number => {
        return SnackBarController.getInstance().showMessage(text, option);
    };

    static clearMessage = (messageId: number): void => {
        return SnackBarController.getInstance().clearMessage(messageId);
    };

    static clearAll = (): void => {
        return SnackBarController.getInstance().clearAll();
    };

    static getInstance(): SnackBarController {
        if (this.instance === null) {
            this.instance = new SnackBarController();
        }
        return this.instance;
    }

    getMessages(): SnackBarMessage[] {
        return this.messages;
    }

    showMessage = (text: string, option: { type?: SnackBarMessageType; clearAfterInMS?: number } = {}): number => {
        const newMessageId = this.counter.getAndInc();

        this.messages.push({
            id: newMessageId,
            text: text,
            type: option.type ?? 'info',
            clearAfterInMS: option.clearAfterInMS ?? -1,
        });

        this.emit('change');
        return newMessageId;
    };

    clearMessage = (messageId: number): void => {
        const messageIndex = this.messages.findIndex((message) => message.id === messageId);
        if (messageIndex === -1) {
            return;
        }

        this.messages.splice(messageIndex, 1);
        this.emit('change');
    };

    clearAll = (): void => {
        if (this.messages.length === 0) return;

        this.messages.length = 0;
        this.emit('change');
    };
}
