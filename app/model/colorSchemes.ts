import { hexToRgb } from './RGB'

export const colorSchemes = {
    'VS Code Dark+': {
        background: hexToRgb('#181818'),
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
        background: hexToRgb('#181818'),
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
        background: hexToRgb('#101114'),
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
        background: hexToRgb('#181818'),
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
        background: hexToRgb('#080c14'),
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
        background: hexToRgb('#141414'),
        comment: hexToRgb('#bdbdbd'),
        number: hexToRgb('#ff8c16'),
        string: hexToRgb('#f1d230'),
        name: hexToRgb('#be405d'),
        member: hexToRgb('#7485ef'),
        keyword1: hexToRgb('#3bbd1a'),
        keyword2: hexToRgb('#5fc9d9'),
        default: hexToRgb('#a9a9a9'),
    },
    'Forest': {
        background: hexToRgb('#06140a'),
        comment: hexToRgb('#6f776f'),
        number: hexToRgb('#ecbc85'),
        string: hexToRgb('#5bafb9'),
        name: hexToRgb('#78dca7'),
        member: hexToRgb('#41a43e'),
        keyword1: hexToRgb('#9ed04b'),
        keyword2: hexToRgb('#b67757'),
        default: hexToRgb('#abb0ab'),
    },
}

export type ColorSchemeName = keyof typeof colorSchemes

export const colorSchemeNames = Object.keys(colorSchemes) as ColorSchemeName[]

export type ColorScheme = (typeof colorSchemes)[ColorSchemeName]

export type ColorKey = keyof ColorScheme
