import type { Source } from './souceCode';
import type { GlyphRaster } from '../draw/rasterizeFont';
import type { SceneBounds } from './SceneBounds';
import { pluck } from '../util/pluck';

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
    const linesNumFractional = (bounds.yMax - bounds.yMin) / fontSize;

    const startLineFractional = getStartLineFractional(source, linesNumFractional, scrollFraction);
    const startLine = Math.floor(startLineFractional);
    const startLineVisibleFraction = startLineFractional - startLine;

    let x = bounds.xMin;
    let y = bounds.yMin - fontSize * startLineVisibleFraction;
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

function getStartLineFractional(source: Source, requiredLinesFractional: number, scrollFraction: number) {
    if (source.linesOffsets.length <= requiredLinesFractional) {
        return 0;
    }
    return pluck(
        0,
        (source.linesOffsets.length - requiredLinesFractional) * scrollFraction,
        source.linesOffsets.length - 1,
    );

}
