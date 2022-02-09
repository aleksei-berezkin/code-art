type Cb = () => Promise<void>;

export function throttle(cb: Cb) {
    _throttle(cb, 200);
}

export function throttleFast(cb: Cb) {
    _throttle(cb, 20);
}

type LCb = () => void;
let onStart: LCb = () => {};
let onEnd: LCb = () => {};
export function setThrottleListeners(_onStart: LCb, _onEnd: LCb) {
    onStart = _onStart;
    onEnd = _onEnd;
}

let nextCb: Cb | undefined;
let state: 'idle' | 'working' = 'idle';
function _throttle(cb: Cb, firstDelay: number) {
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
