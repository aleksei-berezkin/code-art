import type { ScrollFraction } from './ScrollFraction';
import type { Lang } from './Lang';
import type { ImgParams } from './ImgParams';
import type { Source } from './Source';
import { pluck } from '../util/pluck';

const minVH = {
    v: .25,
    h: .1,
};

const excessByLang: {[l in Lang]: ScrollFraction} = {
    js: {
        v: .05,
        h: .5,
    },
    'js min': minVH,
    'js min line': minVH,
};

export function getScrollParam(source: Source, scrollFraction: ScrollFraction): ImgParams['scroll'] {
    const excess = excessByLang[source.spec.lang];
    const vMin = -excess.v;
    const vMax = 1 + excess.v;
    const vVal = pluck(vMin, scrollFraction.v, vMax);

    const hMin = -excess.h;
    const hMax = 1 + excess.h;
    const hVal = pluck(hMin, scrollFraction.h, hMax);

    return {
        v: {
            type: 'slider',
            min: vMin * 100,
            val: vVal * 100,
            max: vMax * 100,
            unit: '%',
        },
        h: {
            type: 'slider',
            min: hMin * 100,
            val: hVal * 100,
            max: hMax * 100,
            unit: '%',
        },
    };
}
