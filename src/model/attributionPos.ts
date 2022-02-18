export const noAttribution = 'none';

export const attributionPos = [
    'top 1',
    'top 2',
    'bottom 1',
    'bottom 2',
    noAttribution,
];

export type AttributionPos = typeof attributionPos extends Array<infer T> ? T : never;
