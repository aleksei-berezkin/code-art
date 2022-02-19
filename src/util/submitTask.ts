type Cb = () => Promise<void>;

export function submitTask(cb: Cb) {
    _submit(cb, 200);
}

export function submitTaskFast(cb: Cb) {
    _submit(cb, 20);
}

type LCb = () => void;
let onStart: LCb = () => {};
let onEnd: LCb = () => {};
export function setTaskExecutorListeners(l: {onStart: LCb, onEnd: LCb}) {
    onStart = l.onStart;
    onEnd = l.onEnd;
}

let nextCb: Cb | undefined;
let state: 'idle' | 'working' = 'idle';
function _submit(cb: Cb, firstDelay: number) {
    nextCb = cb;
    if (state === 'idle') {
        state = 'working';
        setTimeout(() => {
            onStart();
            void task();
        }, firstDelay);
    }
}

const nextDelay = 500;
async function task() {
    if (!nextCb) {
        state = 'idle';
        onEnd();
        return;
    }

    const cb = nextCb;
    nextCb = undefined;

    await cb();

    if (nextCb) {
        setTimeout(task, nextDelay);
    } else {
        state = 'idle';
        onEnd();
    }
}
