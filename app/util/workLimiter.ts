import { delay } from './delay'

export type WorkLimiter = AsyncGenerator<void, void, number>

export async function* createWorkLimiter(work: number = 10, pause: number = 6): WorkLimiter {
    let startMs = Date.now()
    for ( ; ; ) {
        const pauseMultiplier = (yield) || 1
        if (Date.now() >= startMs + work / pauseMultiplier) {
            await delay(pause * pauseMultiplier)
            startMs = Date.now()
        }
    }
}
