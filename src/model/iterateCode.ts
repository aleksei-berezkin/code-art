import type { Source } from './souceCode';
import type { GlyphRaster } from '../draw/rasterizeFont';
import type { SceneBounds } from './SceneBounds';
import { pluck } from '../util/pluck';
import type { ScrollFraction } from './Scroll';

type CodeLetter = {
    pos: number,
    letter: string,
    x: number,
    baseline: number,
}

export function* iterateCode(bounds: SceneBounds,
                             scrollFraction: ScrollFraction,
                             fontSize: number,
                             source: Source,
                             glyphRaster: GlyphRaster): Generator<CodeLetter> {
    const linesNumFractional = (bounds.yMax - bounds.yMin) / fontSize;

    const startLineFractional = getStartLineFractional(source, linesNumFractional, scrollFraction.v);
    const startLine = pluck(0, Math.floor(startLineFractional), source.linesOffsets.length - 1);
    // Negative means a line "before" startLine=0 visible
    const startLineScrolledOutFraction = startLineFractional - startLine;

    let x = bounds.xMin;
    let y = bounds.yMin - fontSize * startLineScrolledOutFraction;
    for (let pos = source.linesOffsets[startLine]; pos < source.text.length; pos++) {
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

// May be negative or out-of-bounds
function getStartLineFractional(source: Source, requiredLinesFractional: number, scrollFraction: number) {
    return (source.linesOffsets.length - requiredLinesFractional) * scrollFraction;
}
