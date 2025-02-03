export function ceilToOdd(n: number, max: number) {
    const c = Math.ceil(n)
    if (c <= 1) {
        return 1
    }
    if (c >= max) {
        return max
    }
    if (c % 2 === 0) {
        return c + 1
    }
    return c
}
