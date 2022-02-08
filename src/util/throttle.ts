type Cb = () => Promise<void>;

export function throttle(cb: Cb) {
    _throttle(cb, 200);
}

export function throttleFast(cb: Cb) {
    _throttle(cb, 20);
}

let nextCb: Cb | undefined;
let state: 'idle' | 'working' = 'idle';
function _throttle(cb: Cb, firstDelay: number) {
    nextCb = cb;
    if (state === 'idle') {
        setTimeout(task, firstDelay);
        state = 'working';
    }
}

const nextDelay = 500;
async function task() {
    if (!nextCb) {
        state = 'idle';
        return;
    }

    const cb = nextCb;
    nextCb = undefined;
    state = 'working'

    await cb();

    if (nextCb) {
        setTimeout(task, nextDelay);
    } else {
        state = 'idle';
    }
}
