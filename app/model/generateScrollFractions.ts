import type { Source } from './Source';
import type { ScrollFraction } from './ScrollFraction';
import { isMinified } from './Lang';

const vRangeMin = .6;
const vRangeNonMin = .9;
const vSize = 2;

const hFrom = .1;
const hToMin = .45;
const hToNonMin = .9;

const hSizeMin = 4;
const hSizeNonMin = 15;

export function generateScrollFractions(
    source: Source,
): ScrollFraction[] {
    const isMin = isMinified(source.spec.lang);
    const vRange = isMin ? vRangeMin : vRangeNonMin;
    const hSize = isMin ? hSizeMin : hSizeNonMin;
    const hTo = isMin ? hToMin : hToNonMin;

    return [...doGenScrollFractions(vRange, hFrom, hTo, hSize)];
}

function* doGenScrollFractions(vRange: number, hFrom: number, hTo: number, hSize: number) {
    const hStep = (hTo - hFrom) / hSize;
    const hBase = hStep * Math.random();

    for (let i = 0; i < vSize; i++) {
        const v = (1 - vRange) / 2 + vRange * Math.random();
        for (let j = 0; j < hSize; j++) {
            yield {
                v,
                h: hFrom + hBase + j * hStep,
            }
        }
    }
}
