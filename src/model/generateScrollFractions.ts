import type { Source } from './Source';
import type { ScrollFraction } from './ScrollFraction';
import { isMinified } from './Lang';

const vSize = 4;
const minifiedHSize = 5;
const nonMinifiedHSize = 8;

export function generateScrollFractions(
    source: Source,
): ScrollFraction[] {
    if (isMinified(source.spec.lang)) {
        return doGenScrollFractions(vSize, minifiedHSize);
    }

    return doGenScrollFractions(vSize, nonMinifiedHSize);
}

function doGenScrollFractions(vSize: number, hSize: number) {
    const vBase = (1 / vSize) * Math.random();
    const hBase = (1 / hSize) * Math.random();

    return Array.from({length: vSize})
        .map((_, i) => vBase + i * (1 / vSize))
        .flatMap(v =>
            Array.from({length: hSize})
                .map((_, i) => ({
                    v,
                    h: hBase + i * (1 / hSize),
                }))
        );
}
