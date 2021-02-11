export function formatTime(timeInMS: number, fps: number): string {
    let rest = Math.floor(timeInMS);

    const millisecond = rest % 1000;
    rest = (rest - millisecond) / 1000;

    const second = rest % 60;
    rest = (rest - second) / 60;

    const minute = rest % 60;
    rest = (rest - minute) / 60;

    const hour = rest;

    const frame = Math.round((millisecond * fps) / 1000);

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second
        .toString()
        .padStart(2, '0')}.${frame.toString().padStart(2, '0')}`;
}
