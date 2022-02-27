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

const fontSizeToCellMultiplier = 5.5;
const fillMatrixMaxSize = 8;

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
    const rowsNum = pluck(1, Math.ceil(pixelSpace.h / (fontSize * fontSizeToCellMultiplier)), fillMatrixMaxSize);
    const colsNum = pluck(1, Math.ceil(pixelSpace.w / (fontSize * fontSizeToCellMultiplier)), fillMatrixMaxSize);
    const fillMatrix: number[] = new Array(rowsNum * colsNum).fill(0);
    for (const c of iterateCode(pixelSpace, extensions, scrollFraction, fontSize, source, alphabetRaster, {sample: .5})) {
        await workLimiter.next();
        const [x, y, w] = applyTx(txMat, c.x + alphabetRaster.avgW / 2 / alphabetRaster.fontSizeRatio, c.baseline + alphabetRaster.maxAscent / 2 / alphabetRaster.fontSizeRatio);
        if (isVisibleInClipSpace(x, y)) {
            const [row, col] = [[y, rowsNum], [x, colsNum]]
                .map(([coord, n]) => pluck(
                    0,
                    // -1..1 -> 0..n - 1
                    Math.floor((coord + 1) / 2 * n),
                    n - 1,
                ));
            fillMatrix[row * colsNum + col] += 1 / w**2;
        }
    }

    const avg = fillMatrix.reduce((a, b) => a + b) / fillMatrix.length;
    const bestSize = Math.min(3, rowsNum, colsNum);
    const best = [...fillMatrix].sort((s, t) => s - t).reverse()
        .slice(0, bestSize)
        .reduce((a, b) => a + b) / bestSize;

    const dev = Math.sqrt(
        fillMatrix
            // Such non-standard deviation (diff with best, not avg) gives better score
            .map(a => (a - best) ** 2)
            .reduce((a, b) => a + b)
        / fillMatrix.length
    );

    const zerosCount = fillMatrix.filter(i => !i).length;
    return avg - dev / fillMatrix.length / 2 - zerosCount * 1000;
}

// noinspection JSUnusedLocalSymbols
function log(fillMatrix: number[], rowsNum: number, colsNum: number) {
    console.log(
        Array.from({length: rowsNum})
            .map((_, row) => fillMatrix.slice(row * colsNum, (row + 1) * colsNum))
    );
}
