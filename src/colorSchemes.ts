import type { ColorScheme } from './ColorScheme';
import type { RGB } from './ColorScheme';

export type ColorSchemeName = 'VS Code Dark+' | 'IntelliJ Darkula' | 'Chrome Dark' | 'Sahara' | 'Ocean' | 'Rainbow';

export const colorSchemes: { [k in ColorSchemeName]: ColorScheme } = {
    'VS Code Dark+': {
        background: hexToRgb('#1e1e1e'),
        comment: hexToRgb('#6a9954'),
        number: hexToRgb('#6897bb'),
        string: hexToRgb('#ce9178'),
        name: hexToRgb('#9cdcfe'),
        member: hexToRgb('#dcdcaa'),
        keyword1: hexToRgb('#569cd6'),
        keyword2: hexToRgb('#c586c0'),
        default: hexToRgb('#e4e4e4'),
    },
    'IntelliJ Darkula': {
        background: hexToRgb('#2b2b2b'),
        comment: hexToRgb('#808080'),
        number: hexToRgb('#b5cea8'),
        string: hexToRgb('#6a8757'),
        name: hexToRgb('#ffc66d'),
        member: hexToRgb('#9876aa'),
        keyword1: hexToRgb('#cc7832'),
        keyword2: hexToRgb('#cc7832'),
        default: hexToRgb('#a9b7c6'),
    },
    'Chrome Dark': {
        background: hexToRgb('#202124'),
        comment: hexToRgb('#747474'),
        number: hexToRgb('#a1f7ea'),   // Changed
        string: hexToRgb('#f28b54'),
        name: hexToRgb('#5db0d7'),
        member: hexToRgb('#d2c057'),
        keyword1: hexToRgb('#9ef2b2'),
        keyword2: hexToRgb('#9a7fd5'),
        default: hexToRgb('#e8eaed'),
    },
    'Sahara': {
        background: hexToRgb('#202020'),
        comment: hexToRgb('#797056'),
        number: hexToRgb('#92d277'),
        string: hexToRgb('#b2b2b2'),
        name: hexToRgb('#eacc66'),
        member: hexToRgb('#eacc66'),
        keyword1: hexToRgb('#f56545'),
        keyword2: hexToRgb('#f56545'),
        default: hexToRgb('#c5cee1'),
    },
    'Ocean': {
        background: hexToRgb('#102820'),
        comment: hexToRgb('#78889d'),
        number: hexToRgb('#77d2a5'),
        string: hexToRgb('#96ab93'),
        name: hexToRgb('#66a8ea'),
        member: hexToRgb('#59d2d2'),
        keyword1: hexToRgb('#4f5bc2'),
        keyword2: hexToRgb('#8e4cd0'),
        default: hexToRgb('#bbb3ad'),
    },
    'Rainbow': {
        background: hexToRgb('#181818'),
        comment: hexToRgb('#bdbdbd'),
        number: hexToRgb('#ff8c16'),
        string: hexToRgb('#f1d230'),
        name: hexToRgb('#7485ef'),
        member: hexToRgb('#5fc9d9'),
        keyword1: hexToRgb('#3bbd1a'),
        keyword2: hexToRgb('#bd1537'),
        default: hexToRgb('#a9a9a9'),
    },
};

function hexToRgb(hex: string): RGB {
    const grp = /#([0-9a-fA-F]{6})/.exec(hex)![1];
    const r = parseInt(grp.slice(0, 2), 16) / 256;
    const g = parseInt(grp.slice(2, 4), 16) / 256;
    const b = parseInt(grp.slice(4, 6), 16) / 256;
    return [r, g, b];
}
