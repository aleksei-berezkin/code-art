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

function getSceneLinesNum(bounds: SceneBounds, fontSize: number) {
    return Math.ceil((bounds.yMax - bounds.yMin) / fontSize)
}

function getSourceStartPos(source: Source, requiredLinesNum: number, scrollFraction: number) {
    const startLine = getSourceStartLine(source, requiredLinesNum, scrollFraction);
    return source.linesOffsets[startLine];
}

function getSourceStartLine(source: Source, requiredLinesNum: number, scrollFraction: number) {
    if (source.linesOffsets.length <= requiredLinesNum) {
        return 0;
    }
    return pluck(
        0,
        // TODO don't round, render part of line
        // After this simulation can be eased
        Math.round((source.linesOffsets.length - requiredLinesNum) * scrollFraction),
        source.linesOffsets.length - 1,
    );

}
