import {hexToRgba} from "./hexToRgba";

export type RGBA = [number, number, number, number];

export type ColorScheme = {
    background: RGBA,
    comment: RGBA,
    number: RGBA,
    string: RGBA,
    name: RGBA,
    member: RGBA,
    keyword1: RGBA,
    keyword2: RGBA,
    default: RGBA,
}


export type ColorSchemeName = 'VS Code Dark+' | 'IntelliJ Darkula' | 'Chrome Dark' | 'Sahara' | 'Ocean' | 'Rainbow';

export const colorSchemes: {[k in ColorSchemeName]: ColorScheme} = {
    'VS Code Dark+': {
        background: hexToRgba('#1e1e1e'),
        comment: hexToRgba('#6a9954'),
        number: hexToRgba('#6897bb'),
        string: hexToRgba('#ce9178'),
        name: hexToRgba('#9cdcfe'),
        member: hexToRgba('#dcdcaa'),
        keyword1: hexToRgba('#569cd6'),
        keyword2: hexToRgba('#c586c0'),
        default: hexToRgba('#e4e4e4'),
    },
    'IntelliJ Darkula': {
        background: hexToRgba('#2b2b2b'),
        comment: hexToRgba('#808080'),
        number: hexToRgba('#b5cea8'),
        string: hexToRgba('#6a8757'),
        name: hexToRgba('#ffc66d'),
        member: hexToRgba('#9876aa'),
        keyword1: hexToRgba('#cc7832'),
        keyword2: hexToRgba('#cc7832'),
        default: hexToRgba('#a9b7c6'),
    },
    'Chrome Dark': {
        background: hexToRgba('#202124'),
        comment: hexToRgba('#747474'),
        number: hexToRgba('#a1f7ea'),   // Changed
        string: hexToRgba('#f28b54'),
        name: hexToRgba('#5db0d7'),
        member: hexToRgba('#d2c057'),
        keyword1: hexToRgba('#9ef2b2'),
        keyword2: hexToRgba('#9a7fd5'),
        default: hexToRgba('#e8eaed'),
    },
    'Sahara': {
        background: hexToRgba('#202020'),
        comment: hexToRgba('#797056'),
        number: hexToRgba('#92d277'),
        string: hexToRgba('#b2b2b2'),
        name: hexToRgba('#eacc66'),
        member: hexToRgba('#eacc66'),
        keyword1: hexToRgba('#f56545'),
        keyword2: hexToRgba('#f56545'),
        default: hexToRgba('#c5cee1'),
    },
    'Ocean': {
        background: hexToRgba('#102820'),
        comment: hexToRgba('#78889d'),
        number: hexToRgba('#77d2a5'),
        string: hexToRgba('#96ab93'),
        name: hexToRgba('#66a8ea'),
        member: hexToRgba('#59d2d2'),
        keyword1: hexToRgba('#4f5bc2'),
        keyword2: hexToRgba('#8e4cd0'),
        default: hexToRgba('#bbb3ad'),
    },
    'Rainbow': {
        background: hexToRgba('#181818'),
        comment: hexToRgba('#bdbdbd'),
        number: hexToRgba('#ff8c16'),
        string: hexToRgba('#f1d230'),
        name: hexToRgba('#7485ef'),
        member: hexToRgba('#5fc9d9'),
        keyword1: hexToRgba('#3bbd1a'),
        keyword2: hexToRgba('#bd1537'),
        default: hexToRgba('#a9a9a9'),
    },
}
