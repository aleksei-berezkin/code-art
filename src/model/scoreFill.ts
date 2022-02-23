import type { Source } from './Source';
import type { Mat4 } from '../util/matrices';
import { iterateCode } from './iterateCode';
import { applyTx } from '../util/applyTx';
import { isVisibleInClipSpace } from '../util/isVisibleInClipSpace';
import { pluck } from '../util/pluck';
import type { ScrollFraction } from './ScrollFraction';
import type { WorkLimiter } from '../util/workLimiter';
import type { AlphabetRaster } from './AlphabetRaster';
import type { PixelSpace } from './PixelSpace';
import type { Extensions } from './Extensions';

const fillMatrixSize = 5;

export async function scoreFill(
    source: Source,
    pixelSpace: PixelSpace,
    extensions:  Extensions,
    txMat: Mat4,
    scrollFraction: ScrollFraction,
    fontSize: number,
    alphabetRaster: AlphabetRaster,
    workLimiter: WorkLimiter,
) {
    const fillMatrix: number[] = new Array(fillMatrixSize**2).fill(0);
    for (const c of iterateCode(pixelSpace, extensions, scrollFraction, fontSize, source, alphabetRaster)) {
        await workLimiter.next();
        const [x, y, w] = applyTx(txMat, c.x + alphabetRaster.avgW / 2, c.baseline + alphabetRaster.maxAscent / 2);
        if (isVisibleInClipSpace(x, y)) {
            const [row, col] = [y, x]
                .map(coord => pluck(
                    0,
                    // -1..1 -> 0..fillMatrixSize
                    Math.floor((coord + 1) / 2 * fillMatrixSize),
                    fillMatrixSize - 1,
                ));
            fillMatrix[row * fillMatrixSize + col] += 1 / w**2;
        }
    }

    const avg = fillMatrix.reduce((a, b) => a + b) / fillMatrixSize**2;
    const best = [...fillMatrix].sort((s, t) => s - t).reverse()
        .slice(0, fillMatrixSize)
        .reduce((a, b) => a + b) / fillMatrixSize;

    // Such non-standard deviation (diff with best, not avg) gives better score
    const dev = Math.sqrt(
        fillMatrix
            .map(a => (a - best) ** 2)
            .reduce((a, b) => a + b)
        / fillMatrixSize**2
    );

    const zerosCount = fillMatrix.filter(i => !i).length;
    return avg - dev / fillMatrixSize - zerosCount * 1000;
}

// noinspection JSUnusedLocalSymbols
function log(fillMatrix: number[]) {
    console.log(
        Array.from({length: fillMatrixSize})
            .map((_, row) => fillMatrix.slice(row * fillMatrixSize, (row + 1) * fillMatrixSize))
    );
}
