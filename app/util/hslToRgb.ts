import type { RGB } from '../model/RGB';

/**
 * https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB
 * @param h 0..360
 * @param s 0..1
 * @param l 0..1
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const h1 = h / 60;
    const x = c * (1 - Math.abs(h1 % 2 - 1));
    let r1: number;
    let g1: number;
    let b1: number;
    if (h1 < 1) {
        [r1, g1, b1] = [c, x, 0];
    } else if (h1 < 2) {
        [r1, g1, b1] = [x, c, 0];
    } else if (h1 < 3) {
        [r1, g1, b1] = [0, c, x];
    } else if (h1 < 4) {
        [r1, g1, b1] = [0, x, c];
    } else if (h1 < 5) {
        [r1, g1, b1] = [x, 0, c];
    } else {
        [r1, g1, b1] = [c, 0, x];
    }
    const m = l - c / 2;
    return [r1 + m, g1 + m, b1 + m];
}
