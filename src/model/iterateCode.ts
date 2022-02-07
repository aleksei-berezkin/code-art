import type { Source } from './souceCode';
import type { SceneBounds } from './SceneBounds';
import { pluck } from '../util/pluck';
import type { ScrollFraction } from './ScrollFraction';
import type { GlyphRaster } from './GlyphRaster';
import { isMinified } from './Lang';

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
    const requiredLinesReal = (bounds.yMax - bounds.yMin) / fontSize;
    const startLineReal = (source.parseResult.lines.length - requiredLinesReal) * scrollFraction.v;
    const startLine = pluck(0, Math.floor(startLineReal), source.parseResult.lines.length - 1);
    // Negative means a line "before" startLine=0 visible
    const startLineScrolledOutFraction = startLineReal - startLine;

    const fontSizeRatio = glyphRaster.fontSize / fontSize;

    const requiredCharsReal = (bounds.xMax - bounds.xMin) / glyphRaster.avgW / fontSizeRatio;
    const lineLength = isMinified(source.spec.lang) ? source.parseResult.avgLineLength : source.parseResult.longestLineLength;
    const xMin = bounds.xMin - scrollFraction.h * glyphRaster.avgW /fontSizeRatio * (lineLength - requiredCharsReal);

    let x = xMin;
    let y = bounds.yMin - fontSize * startLineScrolledOutFraction;
    for (let pos = source.parseResult.lines[startLine].start; pos < source.text.length; pos++) {
        let letter = source.text[pos];
        if (letter === '\n') {
            x = xMin;
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

        const baseline = y + glyphRaster.maxAscent / fontSizeRatio;
        const metrics = glyphRaster.glyphs.get(letter)!;

        if (letter !== ' ') {
            yield {
                pos,
                letter,
                x,
                baseline,
            };
        }

        x += metrics.w / fontSizeRatio;
    }
}
