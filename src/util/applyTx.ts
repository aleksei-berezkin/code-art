import type { Mat4 } from './matrices';
import { mulVec } from './matrices';

export function applyTx(txMat: Mat4, x: number, y: number) {
    let [_x, _y, , _w] = mulVec(txMat, [x, y, 0, 1]);
    _x /= _w;
    _y /= _w;
    return [_x, _y, _w];
}
