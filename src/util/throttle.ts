const firstDelay = 200;
const nextDelay = 50;

let state: 'idle' | 'working' = 'idle';
let nextCb: (() => Promise<void>) | undefined;

export function throttle(cb: () => Promise<void>) {
    nextCb = cb;
    if (state === 'idle') {
        setTimeout(task, firstDelay);
        state = 'working';
    }
}

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
