import type { Source } from './Source';
import type { ScrollFraction } from './ScrollFraction';
import { isMinified } from './Lang';

const vRange = .7;
const vSize = 2;

const hRange = .8;
const minifiedHSize = 6;
const nonMinifiedHSize = 32;

export function generateScrollFractions(
    source: Source,
): ScrollFraction[] {
    const hSize = isMinified(source.spec.lang)
        ? minifiedHSize
        : nonMinifiedHSize;
    return [...doGenScrollFractions(hSize)];
}

function* doGenScrollFractions(hSize: number) {
    const hStep = (hRange / hSize);
    const hBase = hStep * Math.random();

    for (let i = 0; i < vSize; i++) {
        const v = (1 - vRange) / 2 + vRange * Math.random();
        for (let j = 0; j < hSize; j++) {
            yield {
                v,
                h: (1 - hRange) / 2 + hBase + j * hStep,
            }
        }
    }
}
