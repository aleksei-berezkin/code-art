export type Lang = 'js' | 'js min' | 'js min line';

export function isMinified(lang: Lang) {
    return lang === 'js min' || lang === 'js min line';
}
