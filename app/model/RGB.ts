import { pluck } from '../util/pluck';

// Each component 0..1
export type RGB = [number, number, number];

export const rgbSize = 3;

export function hexToRgb(hex: string): RGB {
    const m = /#([0-9a-fA-F]{6})/.exec(hex);
    if (!m) {
        throw new Error(hex);
    }
    const grp = m[1];
    const r = parseInt(grp.slice(0, 2), 16) / 256;
    const g = parseInt(grp.slice(2, 4), 16) / 256;
    const b = parseInt(grp.slice(4, 6), 16) / 256;
    return [r, g, b];
}

export function rgbToHex(rgb: RGB): string {
    if (rgb.length != 3) {
        throw new Error(String(rgb));
    }
    return '#' + rgb
        .map(c => toHexStrWithLeading(pluck(0, Math.round(c * 255), 255)))
        .join('');
}

function toHexStrWithLeading(c: number) {
    if (c < 16) {
        return '0' + c.toString(16);
    }
    return c.toString(16);
}
