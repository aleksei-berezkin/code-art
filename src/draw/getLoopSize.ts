export function getLoopSize(s1: number, s2: number, max: number) {
    const m = Math.max(s1, s2);
    return Math.min(max, Math.ceil(m / 5) * 5);
}
