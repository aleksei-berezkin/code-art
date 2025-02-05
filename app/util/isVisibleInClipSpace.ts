export function isVisibleInClipSpace(x: number, y: number, delta: number = 0.0) {
    return -1 - delta <= x && x <= 1 + delta
        && -1 - delta <= y && y <= 1 + delta
}
