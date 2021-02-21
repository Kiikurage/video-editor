export function linear(t: number): number {
    return t;
}

export const easeInQuad = cubicBezier(0, 0.5, 0.3, 1);

export function easeOutQuad(t: number): number {
    return (1 - t) ** 2;
}

export function cubicBezier(p1: number, p2: number, p3: number, p4: number): (t: number) => number {
    return (t: number) => p1 * (1 - t) ** 3 + 3 * t * (1 - t) * (1 - t) * p2 + 3 * t * t * (1 - t) * p3 + p4 * t ** 3;
}
