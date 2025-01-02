import { delay } from './delay';

type LCb = () => void;
let onStart: LCb = () => {};
let onEnd: LCb = () => {};
export function setTaskExecutorListeners(l: {onStart: LCb, onEnd: LCb}) {
    onStart = l.onStart;
    onEnd = l.onEnd;
}

type Cb = () => Promise<void>;
let nextCb: Cb | undefined;
let pendingOrWorking = false
let localInitial = true

export async function submitTask(newCb: Cb, initial?: boolean) {
    if (nextCb && !initial) return

    nextCb = newCb

    if (pendingOrWorking) return

    pendingOrWorking = true
    onStart()

    await delay(localInitial ? 50 : 200)
    localInitial = false

    while (nextCb) {
        const cb = nextCb
        nextCb = undefined

        await cb()

        if (nextCb) await delay(500)
    }

    onEnd()
    pendingOrWorking = false
}
