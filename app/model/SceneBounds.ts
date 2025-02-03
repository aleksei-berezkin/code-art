import type { PixelSpace } from './PixelSpace'
import type { Extensions } from './Extensions'

export type SceneBounds = ReturnType<typeof getSceneBounds>

export function getSceneBounds(pixelSpace: PixelSpace, ext: Extensions) {
    return {
        xMin: pixelSpace.xMin * ext.xMin,
        yMin: pixelSpace.yMin * ext.yMin,
        xMax: pixelSpace.xMax * ext.xMax,
        yMax: pixelSpace.yMax * ext.yMax,
    }
}
