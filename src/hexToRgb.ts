import type { RGB } from './ColorScheme';

export function hexToRgb(hex: string): RGB {
    const grp = /#([0-9a-fA-F]{6})/.exec(hex)![1];
    const r = parseInt(grp.slice(0, 2), 16) / 256;
    const g = parseInt(grp.slice(2, 4), 16) / 256;
    const b = parseInt(grp.slice(4, 6), 16) / 256;
    return [r, g, b];
}
