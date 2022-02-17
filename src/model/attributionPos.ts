export const noAttribution = 'none';

export const attributionPos = [
    'top left', 'top right',
    'bottom left', 'bottom right',
    noAttribution,
];

export type AttributionPos = typeof attributionPos extends Array<infer T> ? T : never;
