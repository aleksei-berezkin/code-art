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
    const yMin = bounds.yMin - fontSize * startLineScrolledOutFraction;

    const fontSizeRatio = glyphRaster.fontSize / fontSize;

    const requiredCharsReal = (bounds.xMax - bounds.xMin) / glyphRaster.avgW / fontSizeRatio;
    const lineLength = isMinified(source.spec.lang) ? source.parseResult.avgLineLength : source.parseResult.longestLineLength;
    const xMin = bounds.xMin - scrollFraction.h * glyphRaster.avgW / fontSizeRatio * (lineLength - requiredCharsReal);

    for (let line = startLine; line < source.parseResult.lines.length; line++) {
        const y = yMin + (line - startLine) * fontSize;
        if (y > bounds.yMax) {
            break;
        }

        const [lineStart, lineEnd] = source.parseResult.lines[line];
        let x = xMin;
        for (let pos = lineStart; pos < lineEnd; pos++) {
            let letter = source.text[pos];
            if (letter === '\t' || !letter) {
                letter = ' ';
            } else if (letter.charCodeAt(0) < 32) {
                continue;
            }

            const metrics = glyphRaster.glyphs.get(letter)!;

            if (letter !== ' ' && x + metrics.w >= bounds.xMin) {
                const baseline = y + glyphRaster.maxAscent / fontSizeRatio;
                yield {
                    pos,
                    letter,
                    x,
                    baseline,
                };
            }

            x += metrics.w / fontSizeRatio;

            if (x > bounds.xMax) {
                break;
            }
        }
    }
}
