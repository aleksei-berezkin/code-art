import type { Source } from './souceCode';
import type { SceneBounds } from './SceneBounds';
import type { Mat4 } from '../util/matrices';
import type { GlyphRaster } from '../draw/rasterizeFont';
import type { ScrollFraction } from './ScrollFraction';
import { scoreFill } from './scoreFill';

export function generateScrollFraction(
    source: Source,
    sceneBounds: SceneBounds,
    txMat: Mat4,
    fontSize: number,
    glyphRaster: GlyphRaster,
): ScrollFraction {
    if (source.lang === 'js min') {
        return {
            v: Math.random(),
            h: 0,
        };
    }

    return Array.from({length: 9})
        .map(() => {
            const scrollFraction = {
                v: Math.random(),
                h: 0,
            };
            return {
                scrollFraction,
                score: scoreFill(source, sceneBounds, txMat, scrollFraction, fontSize, glyphRaster),
            }
        })
        .reduce((a, b) => a.score > b.score ? a : b)
        .scrollFraction;
}
