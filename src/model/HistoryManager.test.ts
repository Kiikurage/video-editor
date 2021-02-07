import { HistoryManager } from './HistoryManager';

it('Basic usage', () => {
    let state = 0;
    const manager = new HistoryManager(() => state);

    state = 1;
    manager.commit(() => (state = 2));
    state = 3;
    manager.commit(() => (state = 4));
    state = 5;

    expect(manager.undo()).toBe(3);
    expect(manager.undo()).toBe(1);
    expect(manager.undo()).toBeUndefined();
    expect(manager.redo()).toBe(2);
    expect(manager.redo()).toBe(4);
    expect(manager.redo()).toBeUndefined();
});

it('Redo stack should be cleared when new change is commit', () => {
    let state = 0;
    const manager = new HistoryManager(() => state);

    state = 1;
    manager.commit(() => (state = 2));
    state = 3;
    manager.commit(() => (state = 4));
    state = 5;

    expect(manager.undo()).toBe(3);
    expect(manager.undo()).toBe(1);
    expect(manager.undo()).toBeUndefined();
    expect(manager.redo()).toBe(2);
    state = 2;
    manager.commit(() => (state = 6));
    expect(manager.redo()).toBeUndefined();
    expect(manager.undo()).toBe(2);
    expect(manager.undo()).toBe(1);
    expect(manager.undo()).toBeUndefined();
    expect(manager.redo()).toBe(2);
    expect(manager.redo()).toBe(6);
    expect(manager.redo()).toBeUndefined();
});
