export class Counter {
    private cnt = 0;

    getAndInc(): number {
        return ++this.cnt;
    }
}
