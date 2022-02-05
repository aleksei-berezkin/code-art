import { delay } from './delay';

export type WorkLimiter = AsyncGenerator<void>;

export async function* createWorkLimiter(work: number = 10, pause: number = 6): WorkLimiter {
    let startMs = Date.now();
    for ( ; ; ) {
        yield;
        if (Date.now() >= startMs + work) {
            await delay(pause);
            startMs = Date.now();
        }
    }
}
