import type { Source } from './Source';
import type { SceneBounds } from './SceneBounds';
import type { Mat4 } from '../util/matrices';
import { iterateCode } from './iterateCode';
import { applyTx } from '../util/applyTx';
import { isVisibleInClipSpace } from '../util/isVisibleInClipSpace';
import { pluck } from '../util/pluck';
import type { ScrollFraction } from './ScrollFraction';
import type { WorkLimiter } from '../util/workLimiter';
import type { GlyphRaster } from './GlyphRaster';

const fillMatrixSize = 5;

export async function scoreFill(
    source: Source,
    sceneBounds: SceneBounds,
    txMat: Mat4,
    scrollFraction: ScrollFraction,
    fontSize: number,
    glyphRaster: GlyphRaster,
    workLimiter: WorkLimiter,
) {
    const fillMatrix: number[] = new Array(fillMatrixSize**2).fill(0);
    for (const c of iterateCode(sceneBounds, scrollFraction, fontSize, source, glyphRaster)) {
        await workLimiter.next();
        const [x, y, w] = applyTx(txMat, c.x, c.baseline);
        if (isVisibleInClipSpace(x, y)) {
            const [row, col] = [y, x]
                .map(coord => pluck(
                    0,
                    Math.floor((coord + 1) / 2 * fillMatrixSize),
                    fillMatrixSize - 1,
                ));
            fillMatrix[row * fillMatrixSize + col] += 1 / w**2;
        }
    }

    const avg = fillMatrix.reduce((a, b) => a + b) / fillMatrixSize**2;
    const sd = Math.sqrt(
        fillMatrix
            .map(a => (a - avg) ** 2)
            .reduce((a, b) => a + b)
        / fillMatrixSize**2
    );

    const containsZeros = fillMatrix.some(i => !i);
    return avg - sd - (containsZeros ? 1000 : 0);
}

// noinspection JSUnusedLocalSymbols
function log(fillMatrix: number[]) {
    console.log(
        Array.from({length: fillMatrixSize})
            .map((_, row) => fillMatrix.slice(row * fillMatrixSize, (row + 1) * fillMatrixSize))
    );
}
