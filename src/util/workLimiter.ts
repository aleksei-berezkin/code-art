import { delay } from './delay';

export async function* createWorkLimiter(work: number = 10, pause: number = 6) {
    let startMs = Date.now();
    for ( ; ; ) {
        yield;
        if (Date.now() >= startMs + work) {
            await delay(pause);
            startMs = Date.now();
        }
    }
}
