import type { Source } from './Source';
import type { SceneBounds } from './SceneBounds';
import type { Mat4 } from '../util/matrices';
import type { ScrollFraction } from './ScrollFraction';
import type { WorkLimiter } from '../util/workLimiter';
import { scoreFill } from './scoreFill';
import type { GlyphRaster } from './GlyphRaster';
import { isMinified } from './Lang';

export async function generateScrollFraction(
    source: Source,
    sceneBounds: SceneBounds,
    angleY: number,
    txMat: Mat4,
    fontSize: number,
    glyphRaster: GlyphRaster,
    workLimiter: WorkLimiter,
): Promise<ScrollFraction> {
    if (isMinified(source.spec.lang)) {
        return {
            v: Math.random(),
            h: angleY < 0 ? Math.random() * .5 : 0,
        };
    }

    return (await Promise.all(
            Array.from({length: 15})
                .map(async () => {
                    const scrollFraction = {
                        v: Math.random(),
                        h: -Math.random() * .15,
                    };
                    return {
                        scrollFraction,
                        score: await scoreFill(source, sceneBounds, txMat, scrollFraction, fontSize, glyphRaster, workLimiter),
                    }
                })
        ))
        .reduce((a, b) => a.score > b.score ? a : b)
        .scrollFraction;
}
