const _r = [[2, 1], [16, 9], [3, 2], [4, 3]];

export const fitViewRatio = 'fit view';
export const ratios = [
    fitViewRatio,
    ..._r.map(([w, h]) => `${w} / ${h}`),
    '1 / 1',
    ..._r.reverse().map(([h, w]) => `${w} / ${h}`),
];
