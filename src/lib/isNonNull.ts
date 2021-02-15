export function isNonNull<T>(x: T | undefined | null): x is T {
    return x !== undefined && x !== null;
}
