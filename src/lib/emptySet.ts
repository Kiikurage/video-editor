const instance: ReadonlySet<unknown> = new Set<unknown>();

export function emptySet<T>(): ReadonlySet<T> {
    return instance as ReadonlySet<T>;
}
