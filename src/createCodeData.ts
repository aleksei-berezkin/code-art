import { rect2d, vertexSize2d } from './util/rect';
import type { GlyphRaster } from './rasterizeFont';
import type { Source } from './getSource';
import { pluck } from './util/pluck';
import { dpr } from './util/dpr';
import type { CodeColorization } from './colorizeCode';

export function createCodeData(xMin: number, yMin: number,
                               xMax: number, yMax: number,
                               scrollFraction: number,
                               fontSize: number,
                               source: Source, codeColorization: CodeColorization,
                               glyphRaster: GlyphRaster,
): Grid {
    const vertices = [];
    const texPosition = [];
    const colors = [];

    const lRasters = [...glyphRaster.glyphs.values()];
    const maxAscent = lRasters.reduce((max, r) => r.ascent > max ? r.ascent : max, 0) / glyphRaster.sizeRatio;

    const posMin = getPosMin(source, Math.ceil((yMax - yMin) / fontSize), scrollFraction);

    let x = xMin;
    let y = yMin;
    for (let i = posMin; i < source.text.length; i++) {
        let letter = source.text[i];
        if (letter === '\n') {
            x = xMin;
            y += fontSize * dpr;
            if (y > yMax) {
                break;
            }
            continue;
        }

        if (x > xMax) {
            continue;
        }

        if (letter.charCodeAt(0) < 32) {
            if (letter === '\t') {
                letter = ' ';
            } else {
                continue;
            }
        }

        const baseline = y + maxAscent;
        const r = glyphRaster.glyphs.get(letter)!;

        const rectVertices = rect2d(
            x,
            baseline - r.ascent / glyphRaster.sizeRatio * dpr,
            x + r.w / glyphRaster.sizeRatio * dpr,
            baseline + r.descent / glyphRaster.sizeRatio * dpr,
        )
        vertices.push(...rectVertices);

        texPosition.push(...rect2d(
            r.x, r.baseline - r.ascent,
            r.x + r.w, r.baseline + r.descent,
        ));

        const color = codeColorization.colors[i] || [1, 1, 1];
        const verticesNum = rectVertices.length / vertexSize2d;
        colors.push(
            ...Array.from({length: verticesNum})
                .flatMap(() => color)
        );

        x += r.w / glyphRaster.sizeRatio * dpr;
    }

    return {vertices, texPosition, colors};
}

export type Grid = {
    // only x, y; z is left default = 0
    vertices: number[],
    // only x, y
    texPosition: number[],
    colors: number[],
}

function getPosMin(source: Source, linesNum: number, scrollFraction: number) {
    if (source.linesOffsets.length <= linesNum) {
        return 0;
    }
    const fromLine = pluck(
        0,
        Math.round((source.linesOffsets.length - linesNum) * scrollFraction),
        source.linesOffsets.length - 1,
    );
    return source.linesOffsets[fromLine];
}
