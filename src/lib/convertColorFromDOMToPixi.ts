export function convertColorFromDOMToPixi(value: string): number {
    return parseInt(value.substr(1), 16);
}
