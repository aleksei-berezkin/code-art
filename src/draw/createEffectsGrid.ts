import { _rect2d } from './rect';
import type { PixelSpace } from '../model/PixelSpace';
import { getSceneBounds } from '../model/SceneBounds';
import type { Extensions } from '../model/Extensions';

const cellSizeMultiplier = 4;

// Because w is non-linear of (x, y) we can't draw just one rect of (xMin, yMin)-(xMax, yMax).
export function createEffectsGrid(pixelSpace: PixelSpace,
                                  extensions: Extensions,
                                  fontSize: number) {
    const bounds = getSceneBounds(pixelSpace, extensions);
    const vertices: number[] = [];
    const step = fontSize * cellSizeMultiplier;
    for (let x = bounds.xMin; x <= bounds.xMax + step; x += step) {
        for (let y = bounds.yMin; y <= bounds.yMax + step; y += step) {
            vertices.push(..._rect2d(x, y, x + step, y + step));
        }
    }
    return vertices;
}
