// 0 -> 1% -> 0.01
// 1 -> 10% -> 0.1
// 2 -> 100% -> 1
export function percentLogToVal(percentLog: number) {
    return 10 ** (percentLog - 2)
}
