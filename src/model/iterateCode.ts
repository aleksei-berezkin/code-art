import type { Source } from './Source';
import type { ScrollFraction } from './ScrollFraction';
import type { AlphabetRaster } from './AlphabetRaster';
import type { PixelSpace } from './PixelSpace';
import type { Extensions } from './Extensions';
import { getSceneBounds } from './SceneBounds';

type CodeLetter = {
    pos: number,
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
