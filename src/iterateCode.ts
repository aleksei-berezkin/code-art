import type { SceneBounds } from './PixelSpace';
import type { Source } from './souceCode';
import type { GlyphRaster } from './rasterizeFont';
import { getSourceStartPos } from './souceCode';
import { getSceneLinesNum } from './PixelSpace';

type CodeLetter = {
    pos: number,
    letter: string,
    x: number,
    baseline: number,
}

export function* iterateCode(bounds: SceneBounds,
                             scrollFraction: number,
                             fontSize: number,
                             source: Source,
                             glyphRaster: GlyphRaster): Generator<CodeLetter> {
    const posMin = getSourceStartPos(source, getSceneLinesNum(bounds, fontSize), scrollFraction);

    let x = bounds.xMin;
    let y = bounds.yMin;
    for (let pos = posMin; pos < source.text.length; pos++) {
        let letter = source.text[pos];
        if (letter === '\n') {
            x = bounds.xMin;
            y += fontSize;
            if (y > bounds.yMax) {
                break;
            }
            continue;
        }

        if (x > bounds.xMax) {
            continue;
        }

        if (letter === '\t') {
            letter = ' ';
        } else if (letter.charCodeAt(0) < 32) {
            continue;
        }

        const baseline = y + glyphRaster.maxAscent;
        const metrics = glyphRaster.glyphs.get(letter)!;

        if (letter !== ' ') {
            yield {
                pos,
                letter,
                x,
                baseline,
            };
        }

        x += metrics.w / glyphRaster.sizeRatio;
    }
}
