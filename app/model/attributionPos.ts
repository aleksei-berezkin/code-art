export const attributionPos = [
    'top 1' as const,
    'top 2' as const,
    'bottom 1' as const,
    'bottom 2' as const,
]

export type AttributionPos = (typeof attributionPos)[number]
