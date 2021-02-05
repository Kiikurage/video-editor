export interface EventEmitterEvents<T> {
    on<K extends keyof T>(type: K, handler: (data: T[K]) => void): this;

    once<K extends keyof T>(type: K, handler: (data: T[K]) => void): this;

    off<K extends keyof T>(type: K, handler: (data: T[K]) => void): this;

    emit<K extends keyof T>(type: K, data: T[K]): void;
}
