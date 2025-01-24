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

let waitingInitial = true

export async function submitTask(newCb: Cb, initial?: boolean) {
    if (waitingInitial && !initial || nextCb) return

    nextCb = newCb

    if (pendingOrWorking) return

    pendingOrWorking = true
    waitingInitial = false
    onStart()
    
    await delay(initial ? 50 : 200)
    
    while (nextCb) {
        const cb = nextCb
        nextCb = undefined
        
        await cb()
        
        if (nextCb) await delay(500)
    }

    onEnd()
    pendingOrWorking = false
}
