export function delay(ms: number = 6) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function delayToAnimationFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve))
}
