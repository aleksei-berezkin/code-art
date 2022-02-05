import type { Source } from './souceCode';
import type { SceneBounds } from './SceneBounds';
import type { Mat4 } from '../util/matrices';
import type { GlyphRaster } from '../draw/rasterizeFont';
import type { ScrollFraction } from './ScrollFraction';
import { scoreFill } from './scoreFill';
import { createWorkLimiter } from '../util/workLimiter';

export async function generateScrollFraction(
    source: Source,
    sceneBounds: SceneBounds,
    txMat: Mat4,
    fontSize: number,
    glyphRaster: GlyphRaster,
): Promise<ScrollFraction> {
    if (source.lang === 'js min') {
        return {
            v: Math.random(),
            h: 0,
        };
    }

    const workLimiter = createWorkLimiter();
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
