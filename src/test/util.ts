export function fixDateNow(dateNowInMS = 0): void {
    Date.now = jest.fn(() => dateNowInMS);
}

export function advanceDateNow(durationInMS: number): void {
    fixDateNow(Date.now() + durationInMS);
}
