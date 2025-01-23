import type { Size } from '../model/Size';
import { dpr } from '../util/dpr';

export function getPixelSpaceSize(canvasEl: HTMLCanvasElement): Size {
    return {
        w: canvasEl.width / dpr(),
        h: canvasEl.height / dpr(),
    };
}
