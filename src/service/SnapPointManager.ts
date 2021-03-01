const EMPTY_SET: ReadonlySet<string> = new Set();

export class SnapPointManager {
    private readonly values: number[] = [];
    private readonly valueObjectIdsMap = new Map<number, Set<string>>();
    private readonly objectIdValuesMap = new Map<string, number[]>();

    clear(): void {
        this.values.length = 0;
        this.valueObjectIdsMap.clear();
        this.objectIdValuesMap.clear();
    }

    getObjectsAt(value: number): ReadonlySet<string> {
        return this.valueObjectIdsMap.get(value) ?? EMPTY_SET;
    }

    add(objectId: string, ...values: number[]): void {
        for (const value of values) {
            let objectIds = this.valueObjectIdsMap.get(value);
            if (objectIds === undefined) {
                objectIds = new Set();
                this.valueObjectIdsMap.set(value, objectIds);

                let insertPosition = this.values.findIndex((v) => v > value);
                if (insertPosition === -1) {
                    insertPosition = this.values.length;
                }
                this.values.splice(insertPosition, 0, value);
            }
            objectIds.add(objectId);
        }

        this.objectIdValuesMap.set(objectId, values);
    }

    delete(objectId: string): void {
        const values = this.objectIdValuesMap.get(objectId);
        if (values === undefined) return;

        for (const value of values) {
            const objectIds = this.valueObjectIdsMap.get(value);
            if (objectIds === undefined) continue;

            objectIds.delete(objectId);
            if (objectIds.size === 0) {
                this.valueObjectIdsMap.delete(value);
                this.values.splice(this.values.indexOf(value), 1);
            }
        }

        this.objectIdValuesMap.delete(objectId);
    }

    check(value: number, windowSize: number): number | null {
        if (this.values.length === 0) return null;

        let min = 0;
        let max = this.values.length;
        while (max - min > 1) {
            const mid = (max + min) >> 1;
            const midValue = this.values[mid];

            if (midValue === value) {
                break;
            } else if (midValue > value) {
                max = mid;
            } else {
                min = mid;
            }
        }

        const mid = (max + min) >> 1;
        let snapValue: number;
        if (mid === this.values.length - 1) {
            snapValue = this.values[mid];
        } else {
            const snapValue1 = this.values[mid];
            const snapValue2 = this.values[mid + 1];
            if (Math.abs(snapValue1 - value) < Math.abs(snapValue2 - value)) {
                snapValue = snapValue1;
            } else {
                snapValue = snapValue2;
            }
        }

        return Math.abs(snapValue - value) <= windowSize ? snapValue : null;
    }
}
