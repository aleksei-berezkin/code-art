import type { Source } from './souceCode';
import type { SceneBounds } from './SceneBounds';
import type { Mat4 } from '../util/matrices';
import type { GlyphRaster } from '../draw/rasterizeFont';
import { iterateCode } from './iterateCode';
import { applyTx } from '../util/applyTx';
import { isVisibleInClipSpace } from '../util/isVisibleInClipSpace';

export function scoreScene(
    source: Source,
    sceneBounds: SceneBounds,
    txMat: Mat4,
    scrollFraction: number,
    fontSize: number,
    glyphRaster: GlyphRaster,
) {
    let score = 0;
    for (const c of iterateCode(sceneBounds, scrollFraction, fontSize, source, glyphRaster)) {
        const [x, y, w] = applyTx(txMat, c.x, c.baseline);
        if (isVisibleInClipSpace(x, y)) {
            score += 1 / w ** 2;
        }
    }
    return score;
}
