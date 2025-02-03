import type { Mat4 } from './matrices'
import { mulVec } from './matrices'

export function applyTx(txMat: Mat4, x: number, y: number) {
    const [_x, _y, , _w] = mulVec(txMat, [x, y, 0, 1])
    return [_x / _w, _y / _w, _w]
}
