import type { Source } from './Source';
import type { ScrollFraction } from './ScrollFraction';
import { isMinified } from './Lang';

export function generateScrollFractions(
    source: Source,
): ScrollFraction[] {
    const v = isMinified(source.spec.lang)
        ? .2 + Math.random() * .6
        : .1 + Math.random() * .8;

    return [
        {v, h: .2 + Math.random() * .1},
        {v, h: .4 + Math.random() * .1},
        {v, h: .6 + Math.random() * .1},
        {v, h: .8 + Math.random() * .1},
    ];
}
