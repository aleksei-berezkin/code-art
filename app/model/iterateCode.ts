import type { Source } from './Source';
import type { ScrollFraction } from './ScrollFraction';
import type { AlphabetRaster } from './AlphabetRaster';
import type { PixelSpace } from './PixelSpace';
import type { Extensions } from './Extensions';
import { getSceneBounds } from './SceneBounds';

type CodeLetter = {
    line: number,
    pos: number,
    isFirstOnLine: boolean,
    letter: string,
    x: number,
    baseline: number,
}

export function* iterateCode(pixelSpace: PixelSpace,
                             extensions: Extensions,
                             scrollFraction: ScrollFraction,
                             fontSize: number,
                             source: Source,
                             alphabetRaster: AlphabetRaster,
): Generator<CodeLetter> {
    const lineHeight = Math.max(fontSize, (alphabetRaster.maxAscent + alphabetRaster.maxDescent) / alphabetRaster.fontSizeRatio);
    const charWidth = alphabetRaster.avgW / alphabetRaster.fontSizeRatio;

    const bounds = getSceneBounds(pixelSpace, extensions);
   
    const yMin = -scrollFraction.v * lineHeight * source.parseResult.lines.length;

    const xMin = -scrollFraction.h * charWidth * source.parseResult.lineLengthChars;

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
        let isFirstOnLine = true;
        for (let pos = lineStart; pos < lineEnd; pos++) {
            const letter = source.text[pos];
            if (letter !== '\t' && letter.charCodeAt(0) < 32) {
                continue;
            }

            const metrics = alphabetRaster.glyphs.get(letter === '\t' ? ' ' : letter)!;

            if (letter !== ' ' && letter !== '\t') {
                if (x + metrics.w >= bounds.xMin) {
                    const baseline = y + alphabetRaster.maxAscent / alphabetRaster.fontSizeRatio;
                    yield {
                        isFirstOnLine,
                        line,
                        pos,
                        letter,
                        x,
                        baseline,
                    };
                }
                isFirstOnLine = false;
            }

            x += metrics.w / alphabetRaster.fontSizeRatio;

            if (x > bounds.xMax) {
                break;
            }
        }
    }
}
