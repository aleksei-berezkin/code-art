import { delay } from './delay';

type Cb = () => Promise<void>;

export function submitTask(cb: Cb, fast?: boolean) {
    _submit(cb, fast ? 50 : 200)
}

type LCb = () => void;
let onStart: LCb = () => {};
let onEnd: LCb = () => {};
export function setTaskExecutorListeners(l: {onStart: LCb, onEnd: LCb}) {
    onStart = l.onStart;
    onEnd = l.onEnd;
}

let nextCb: Cb | undefined;
let pendingOrWorking = false

async function _submit(cb: Cb, firstDelay: number) {
    if (nextCb) return

    nextCb = cb

    if (pendingOrWorking) return

    pendingOrWorking = true
    onStart()

    await delay(firstDelay)

    while (nextCb) {
        const cb = nextCb
        nextCb = undefined

        await cb()

        if (nextCb) await delay(500)
    }

    onEnd()
    pendingOrWorking = false
}
