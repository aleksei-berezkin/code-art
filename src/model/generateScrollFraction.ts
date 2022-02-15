import type { Source } from './Source';
import type { SceneBounds } from './SceneBounds';
import type { Mat4 } from '../util/matrices';
import type { ScrollFraction } from './ScrollFraction';
import type { WorkLimiter } from '../util/workLimiter';
import { scoreFill } from './scoreFill';
import type { AlphabetRaster } from './AlphabetRaster';
import { isMinified } from './Lang';

export async function generateScrollFraction(
    source: Source,
    sceneBounds: SceneBounds,
    angleY: number,
    txMat: Mat4,
    fontSize: number,
    alphabetRaster: AlphabetRaster,
    workLimiter: WorkLimiter,
): Promise<ScrollFraction | undefined> {
    const isMin = isMinified(source.spec.lang);

    const {scrollFraction, score} = (await Promise.all(
            Array.from({length: isMin ? 5 : 15})
                .map(async () => {
                    const scrollFraction = {
                        v: Math.random(),
                        h: isMinified(source.spec.lang)
                            ? Math.random() * .5
                            : -Math.random() * .15,
                    };
                    return {
                        scrollFraction,
                        score: await scoreFill(source, sceneBounds, txMat, scrollFraction, fontSize, alphabetRaster, workLimiter),
                    }
                })
        ))
        .reduce((a, b) => a.score > b.score ? a : b);

    if (score < -100) {
        // Bad angles
        return undefined;
    }

    return scrollFraction;
}
