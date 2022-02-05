import type { Source } from './souceCode';
import type { SceneBounds } from './SceneBounds';
import type { Mat4 } from '../util/matrices';
import type { GlyphRaster } from '../draw/rasterizeFont';
import type { ScrollFraction } from './ScrollFraction';
import type { WorkLimiter } from '../util/workLimiter';
import { scoreFill } from './scoreFill';

export async function generateScrollFraction(
    source: Source,
    sceneBounds: SceneBounds,
    txMat: Mat4,
    fontSize: number,
    glyphRaster: GlyphRaster,
    workLimiter: WorkLimiter,
): Promise<ScrollFraction> {
    if (source.lang === 'js min') {
        return {
            v: Math.random(),
            h: 0,
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
