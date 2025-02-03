export function pickRandom<T>(a: T[]): T {
    return a[Math.floor(a.length * Math.random())]
}
