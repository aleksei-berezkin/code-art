import type { Size } from '../model/Size'

export function calcOptimalFontSize(sizePx: Size) {
    return Math.min(36, 18 + sizePx.w / 1280 * 18)
}
