export function snap(actualValue: number, snapValues: number[], threshold = 8): number {
    const best = { snapPosition: -1, distance: Number.MAX_VALUE };
    for (const snapValue of snapValues) {
        const distance = Math.abs(snapValue - actualValue);
        if (distance < best.distance) {
            best.snapPosition = snapValue;
            best.distance = distance;
        }
    }

    return best.distance < threshold ? best.snapPosition : actualValue;
}
