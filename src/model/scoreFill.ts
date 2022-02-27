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

const fontSizeToCellMultiplier = 2.7;

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
    const rowsNum = Math.max(2, Math.ceil(pixelSpace.h / (fontSize * fontSizeToCellMultiplier)));
    const colsNum = Math.max(2, Math.ceil(pixelSpace.w / (fontSize * fontSizeToCellMultiplier)));
    const fillMatrix: number[] = new Array(rowsNum * colsNum).fill(0);
    for (const c of iterateCode(pixelSpace, extensions, scrollFraction, fontSize, source, alphabetRaster)) {
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

    const sum = fillMatrix.reduce((a, b) => a + b);

    const zerosCount = fillMatrix.filter(s => !s).length;
    return sum / (zerosCount + 1);
}

// noinspection JSUnusedLocalSymbols
function log(fillMatrix: number[], rowsNum: number, colsNum: number) {
    console.log(
        Array.from({length: rowsNum})
            .map((_, row) => fillMatrix.slice(row * colsNum, (row + 1) * colsNum))
    );
}
