export function isVisibleInClipSpace(x: number, y: number) {
    return -1 <= x && x <= 1 && -1 <= y && y <= 1
}
