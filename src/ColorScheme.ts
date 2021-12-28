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


export type ColorSchemeName = 'VS Code Dark+' | 'IntelliJ Darkula';

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
}
