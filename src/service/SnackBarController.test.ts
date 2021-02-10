import { noop } from '../lib/util';
import { SnackBarController } from './SnackBarController';

let onChange: jest.Mock;

beforeEach(() => {
    onChange = jest.fn(noop);
    SnackBarController.getInstance().on('change', onChange);
});

afterEach(() => {
    SnackBarController.getInstance().off('change', onChange);
    SnackBarController.clearAll();
});

describe('showMessage()', () => {
    it('As default, message should be { type: "info", clearAfterInMS: -1 }', () => {
        expect(SnackBarController.getMessages()).toEqual([]);
        expect(onChange.mock.calls.length).toBe(0);

        const messageId = SnackBarController.showMessage('test message');

        expect(SnackBarController.getMessages()).toEqual([
            {
                id: messageId,
                text: 'test message',
                type: 'info',
                clearAfterInMS: -1,
            },
        ]);
        expect(onChange.mock.calls.length).toBe(1);
    });

    it('Message should be initialized with specified value', () => {
        expect(SnackBarController.getMessages()).toEqual([]);
        expect(onChange.mock.calls.length).toBe(0);

        const messageId = SnackBarController.showMessage('test message', { type: 'error', clearAfterInMS: 5000 });

        expect(SnackBarController.getMessages()).toEqual([
            {
                id: messageId,
                text: 'test message',
                type: 'error',
                clearAfterInMS: 5000,
            },
        ]);
        expect(onChange.mock.calls.length).toBe(1);
    });
});

describe('clearMessage()', () => {
    it('Message should be removed correctly', () => {
        expect(SnackBarController.getMessages()).toEqual([]);
        expect(onChange.mock.calls.length).toBe(0);

        const messageId = SnackBarController.showMessage('test message');
        expect(SnackBarController.getMessages()).toEqual([
            {
                id: messageId,
                text: 'test message',
                type: 'info',
                clearAfterInMS: -1,
            },
        ]);
        expect(onChange.mock.calls.length).toBe(1);

        SnackBarController.clearMessage(messageId);
        expect(SnackBarController.getMessages()).toEqual([]);
        expect(onChange.mock.calls.length).toBe(2);
    });

    it('Should do nothing when remove target is not found', () => {
        expect(SnackBarController.getMessages()).toEqual([]);
        expect(onChange.mock.calls.length).toBe(0);

        SnackBarController.clearMessage(12345);
        expect(SnackBarController.getMessages()).toEqual([]);
        expect(onChange.mock.calls.length).toBe(0);
    });
});

describe('clearAll()', () => {
    it('should remove all messages', () => {
        expect(SnackBarController.getMessages().length).toBe(0);
        expect(onChange.mock.calls.length).toBe(0);

        SnackBarController.showMessage('test message 1');
        expect(SnackBarController.getMessages().length).toBe(1);
        expect(onChange.mock.calls.length).toBe(1);

        SnackBarController.showMessage('test message 2');
        expect(SnackBarController.getMessages().length).toBe(2);
        expect(onChange.mock.calls.length).toBe(2);

        SnackBarController.clearAll();
        expect(SnackBarController.getMessages().length).toBe(0);
        expect(onChange.mock.calls.length).toBe(3);
    });

    it('When no messages exist, should do nothing', () => {
        expect(SnackBarController.getMessages().length).toBe(0);
        expect(onChange.mock.calls.length).toBe(0);

        SnackBarController.clearAll();
        expect(SnackBarController.getMessages().length).toBe(0);
        expect(onChange.mock.calls.length).toBe(0);
    });
});
