import { setRect2d, rect2dSize } from './rect';
import type { PixelSpace } from '../model/PixelSpace';
import { getSceneBounds } from '../model/SceneBounds';
import type { Extensions } from '../model/Extensions';
import type { WorkLimiter } from '../util/workLimiter';

const cellSizeMultiplier = 4;
const maxRectsNum = 2000;

// Because w is non-linear of (x, y) we can't draw just one rect of (xMin, yMin)-(xMax, yMax).
export async function createEffectsGrid(pixelSpace: PixelSpace,
                                  extensions: Extensions,
                                  fontSize: number,
                                  workLimiter: WorkLimiter,
) {
    const bounds = getSceneBounds(pixelSpace, extensions);
    let step = fontSize * cellSizeMultiplier;
    for ( ; ; ) {
        await workLimiter.next();
        const rectsNum = Math.ceil((bounds.xMax + step - bounds.xMin) / step)
                * Math.ceil((bounds.yMax + step - bounds.yMin) / step);
        if (rectsNum > maxRectsNum) {
            step *= 1.5;
            continue
        }

        const vertices = new Float32Array(rectsNum * rect2dSize);
        let count = 0;
        for (let x = bounds.xMin; x < bounds.xMax + step; x += step) {
            for (let y = bounds.yMin; y < bounds.yMax + step; y += step) {
                await workLimiter.next();
                setRect2d(vertices, count * rect2dSize, x, y, x + step, y + step);
                count++;
            }
        }
        return vertices;
    }
}
