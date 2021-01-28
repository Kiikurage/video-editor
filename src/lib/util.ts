export function assert(condition: boolean, message: string): asserts condition {
    if (!condition) throw new Error(`Assertion Failed: ${message}`);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}
