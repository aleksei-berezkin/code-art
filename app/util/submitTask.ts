import { delay } from './delay';

type ListenerCb = () => void;
let onStart: ListenerCb = () => {};
let onEnd: ListenerCb = () => {};
export function setTaskExecutorListeners(l: {onStart: ListenerCb, onEnd: ListenerCb}) {
    onStart = l.onStart;
    onEnd = l.onEnd;
}

type Cb = () => Promise<void>;
let nextCb: Cb | undefined;
let working = false

let counter = 0

export async function submitTask(newCb: Cb) {
    if (nextCb) return

    nextCb = newCb

    if (working) return

    working = true
    onStart()

    await delay(counter++ ? 200 : 50)

    while (nextCb) {
        const cb = nextCb
        nextCb = undefined
        
        await cb()
        
        if (nextCb) await delay(500)
    }

    onEnd()
    working = false
}
