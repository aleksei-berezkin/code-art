import { useStore } from '../store'
import { delay } from './delay'

type Cb = () => Promise<void>
let nextCb: Cb | undefined

let counter = 0

export async function submitTask(newCb: Cb) {
    nextCb = newCb

    if (useStore.getState().progress) return
    useStore.getState().setProgress(true)

    await delay(counter++ ? 200 : 50)

    while (nextCb) {
        const cb = nextCb
        nextCb = undefined

        await cb()

        if (nextCb) await delay(500)
    }

    useStore.getState().setProgress(false)
}
