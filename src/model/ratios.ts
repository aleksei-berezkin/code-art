const _r: [number, number, string?][] = [[100, 42, 'DEV.to'], [2, 1], [12, 6.3, 'Open Graph'], [16, 9], [3, 2], [4, 3], [1, 1, 'Instagram']];

export const fitViewRatio = 'fit view';
export const displayedRatios = [
    fitViewRatio,
    ..._r.map(([w, h, n]) => toDisplayedRatio(w, h, n)),
    ..._r.filter(([_, __, n]) => !n).reverse().map(([w, h]) => toDisplayedRatio(h, w)),
];

function toDisplayedRatio(w: number, h: number, name?: string) {
    return `${w} / ${h}${name ? ' ' + name : ''}`;
}

export function getFractionFromDisplayedRatio(s: string) {
    const m = /[\d.]+ \/ [\d.].*/.exec(s)
    return m ? m[0] : undefined;
}
