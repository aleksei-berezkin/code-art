import type { Source } from './Source';
import type { ScrollFraction } from './ScrollFraction';
import { isMinified } from './Lang';

export function generateScrollFractions(
    source: Source,
): ScrollFraction[] {

    if (isMinified(source.spec.lang)) {
        const v = .2 + Math.random() * .6;
        const h = .2 + Math.random() * .6;
        return [
            {v, h},
            {v, h: .15 + h / 10},
        ];
    }

    const v = Math.random();
    const h = Math.random() * .4;
    return [
        {v, h},
        {v, h: h / 1.3},
        {v, h: h / 2.2},
        {v, h: h / 6},
    ];
}
