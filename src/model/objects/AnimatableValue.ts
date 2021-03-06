import { linear } from '../../lib/easing';

export const AnimatableValueType = {
    Numeric: 'NUMERIC',
    Color: 'COLOR',
};
export type AnimatableValueType = typeof AnimatableValueType[keyof typeof AnimatableValueType];

export interface AnimatableValue<T extends AnimatableValueType = AnimatableValueType> {
    type: T;
    keyframes: AnimatableValueKeyframe[];
}

const easingFunction = linear;

export const AnimatableValue = {
    constant: (value: number, type: AnimatableValueType): AnimatableValue => {
        return { type, keyframes: [{ timing: 0, value: value }] };
    },
    set: (value: AnimatableValue, newFrameTiming: number, newFrameValue: number): AnimatableValue => {
        const i = value.keyframes.findIndex((frame) => frame.timing === newFrameTiming);
        if (i === -1) {
            const newKeyframes = [
                ...value.keyframes.slice(),
                {
                    timing: newFrameTiming,
                    value: newFrameValue,
                },
            ].sort((f1, f2) => f1.timing - f2.timing);

            return { ...value, keyframes: newKeyframes };
        } else {
            const newKeyframes = value.keyframes.slice();
            newKeyframes[i] = { ...newKeyframes[i], value: newFrameValue };

            return { ...value, keyframes: newKeyframes };
        }
    },
    interpolate: (value: AnimatableValue, tStart: number, tEnd: number, tCurrent: number): number => {
        if (value.keyframes.length === 1 || tCurrent < tStart) {
            return value.keyframes[0].value;
        }
        if (tEnd < tCurrent) {
            return value.keyframes[value.keyframes.length - 1].value;
        }
        const timing = (tCurrent - tStart) / (tEnd - tStart);

        let i = value.keyframes.length - 1;
        for (; i >= 0; i--) {
            if (value.keyframes[i].timing <= timing) {
                break;
            }
        }
        if (i === value.keyframes.length - 1) {
            return value.keyframes[value.keyframes.length - 1].value;
        }

        const prevFrame = value.keyframes[i];
        const nextFrame = value.keyframes[i + 1];
        const t = (timing - prevFrame.timing) / (nextFrame.timing - prevFrame.timing);

        switch (value.type) {
            case AnimatableValueType.Numeric:
                return prevFrame.value * (1 - easingFunction(t)) + nextFrame.value * easingFunction(t);

            case AnimatableValueType.Color: {
                const r1 = (prevFrame.value & 0xff0000) >> 16;
                const g1 = (prevFrame.value & 0x00ff00) >> 8;
                const b1 = prevFrame.value & 0x0000ff;

                const r2 = (nextFrame.value & 0xff0000) >> 16;
                const g2 = (nextFrame.value & 0x00ff00) >> 8;
                const b2 = nextFrame.value & 0x0000ff;

                const r = Math.round(r1 * (1 - easingFunction(t)) + r2 * easingFunction(t));
                const g = Math.round(g1 * (1 - easingFunction(t)) + g2 * easingFunction(t));
                const b = Math.round(b1 * (1 - easingFunction(t)) + b2 * easingFunction(t));
                return (r << 16) | (g << 8) | b;
            }
            default:
                throw new Error(`Unsupported animatable value type: ${value.type}`);
        }
    },
};
export type NumericAnimatableValue = AnimatableValue<typeof AnimatableValueType.Numeric>;
export type ColorAnimatableValue = AnimatableValue<typeof AnimatableValueType.Color>;

export interface AnimatableValueKeyframe {
    timing: number;
    value: number;
}
