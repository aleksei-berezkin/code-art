import type { PixelSpace } from './PixelSpace';
import type { Extensions } from './Extensions';

export type SceneBounds = ReturnType<typeof getSceneBounds>;

export function getSceneBounds(pSp: PixelSpace, ext: Extensions) {
    return {
        xMin: pSp.xMin * ext.xMin,
        yMin: pSp.yMin * ext.yMin,
        xMax: pSp.xMax * ext.xMax,
        yMax: pSp.yMax * ext.yMax,
    };
}

export function getSceneLinesNum(bounds: SceneBounds, fontSize: number) {
    return Math.ceil((bounds.yMax - bounds.yMin) / fontSize)
}
