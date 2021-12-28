import type { RGBA } from './ColorScheme';

export function hexToRgba(hex: string): RGBA {
    const grp = /#([0-9a-fA-F]{6,8})/.exec(hex)![1];
    const r = parseInt(grp.slice(0, 2), 16) / 256;
    const g = parseInt(grp.slice(2, 4), 16) / 256;
    const b = parseInt(grp.slice(4, 6), 16) / 256;
    const a = grp.length === 8 ? parseInt(grp.slice(6, 8), 16) / 256 : 1;
    return [r, g, b, a];
}
