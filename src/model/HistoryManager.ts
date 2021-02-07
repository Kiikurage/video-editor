interface Commit<T> {
    undo: T;
    redo: T;
}

export class HistoryManager<T> {
    private readonly commits: Commit<T>[] = [];
    private lastCommitIndex = -1;
    private readonly getState: () => T;

    constructor(getState: () => T) {
        this.getState = getState;
    }

    undo = (): T | undefined => {
        if (this.lastCommitIndex < 0) return undefined;
        const commit = this.commits[this.lastCommitIndex];

        const state = commit.undo;
        this.lastCommitIndex--;

        return state;
    };

    redo = (): T | undefined => {
        if (this.lastCommitIndex >= this.commits.length - 1) return undefined;

        this.lastCommitIndex++;
        const commit = this.commits[this.lastCommitIndex];

        return commit.redo;
    };

    commit = (fn: () => void): void => {
        const undoState = this.getState();
        fn();
        const redoState = this.getState();

        if (this.lastCommitIndex < this.commits.length - 1) {
            this.commits.length = this.lastCommitIndex + 1;
        }
        this.commits.push({ undo: undoState, redo: redoState });
        this.lastCommitIndex++;
    };
}
