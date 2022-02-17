import type { Source } from './Source';
import type { SceneBounds } from './SceneBounds';
import type { ScrollFraction } from './ScrollFraction';
import type { AlphabetRaster } from './AlphabetRaster';
import { isMinified } from './Lang';

type CodeLetter = {
    pos: number,
    letter: string,
    x: number,
    baseline: number,
}

export function* iterateCode(bounds: SceneBounds,
                             _scrollFraction: ScrollFraction,
                             fontSize: number,
                             source: Source,
                             alphabetRaster: AlphabetRaster,
): Generator<CodeLetter> {
    const lineHeight = Math.max(fontSize, (alphabetRaster.maxAscent + alphabetRaster.maxDescent) / alphabetRaster.fontSizeRatio);
    const charWidth = alphabetRaster.avgW / alphabetRaster.fontSizeRatio;

    const scrollFraction = amplifyScroll(_scrollFraction, source, bounds, lineHeight, charWidth);

    const viewportLinesNumber = (bounds.yMax - bounds.yMin) / lineHeight;
    const yMin = bounds.yMin - scrollFraction.v * fontSize * Math.max(viewportLinesNumber * .1, source.parseResult.lines.length - viewportLinesNumber);

    const viewportLineLength = (bounds.xMax - bounds.xMin) / charWidth;
    const lineLength = isMinified(source.spec.lang) ? source.parseResult.avgLineLength : source.parseResult.longestLineLength;
    const xMin = bounds.xMin - scrollFraction.h * charWidth * Math.max(viewportLineLength * .1, lineLength - viewportLineLength);

    for (let line = 0; line < source.parseResult.lines.length; line++) {
        const y = yMin + line * lineHeight;
        if (y + lineHeight < bounds.yMin) {
            continue;
        }
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

            const metrics = alphabetRaster.glyphs.get(letter)!;

            if (letter !== ' ' && x + metrics.w >= bounds.xMin) {
                const baseline = y + alphabetRaster.maxAscent / alphabetRaster.fontSizeRatio;
                yield {
                    pos,
                    letter,
                    x,
                    baseline,
                };
            }

            x += metrics.w / alphabetRaster.fontSizeRatio;

            if (x > bounds.xMax) {
                break;
            }
        }
    }
}

// Like 0..1 => -0.2..+1.2 to include edges
function amplifyScroll(scrollFraction: ScrollFraction, source: Source, bounds: SceneBounds, lineHeight: number, charWidth: number) {
    const [v, h] = (function* () {
        for (const [visiblePx, itemPx, totalItemsNum, inputScrollFraction, extraMul] of [
            [
                bounds.yMax - bounds.yMin, lineHeight, source.parseResult.lines.length, scrollFraction.v, .4,
            ],
            [
                bounds.xMax - bounds.xMin, charWidth, isMinified(source.spec.lang) ? source.parseResult.avgLineLength : source.parseResult.longestLineLength, scrollFraction.h, .7,
            ],
        ]) {
            const visibleItems = visiblePx / itemPx;
            const extraItems = visibleItems * extraMul;
            const oneItemScrollAmount = 1 / totalItemsNum;
            const extraScrollFraction = extraItems * oneItemScrollAmount;
            yield -extraScrollFraction + (1 + 2 * extraScrollFraction) * inputScrollFraction;
        }
    })();
    return {v, h};
}
