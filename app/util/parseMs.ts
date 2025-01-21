export function parseMs(timeMs: string) {
    const m = /(\d+)ms/.exec(timeMs);
    if (m) {
        return Number(m[1]);
    }
    throw new Error(`Cannot parse ${timeMs}`);
}
