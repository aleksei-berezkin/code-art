import { rect2d, vertexSize2d } from './util/rect';
import type { GlyphRaster } from './rasterizeFont';
import { Source, getSourceStartPos } from './souceCode';
import type { CodeColorization } from './colorizeCode';
import { getSceneLinesNum, SceneBounds } from './PixelSpace';

export function createCodeSceneData(bounds: SceneBounds,
                                    scrollFraction: number,
                                    fontSize: number,
                                    source: Source,
                                    codeColorization: CodeColorization,
                                    glyphRaster: GlyphRaster,
): CodeSceneData {
    const vertices = [];
    const glyphTexPosition = [];
    const colors = [];

    const lRasters = [...glyphRaster.glyphs.values()];
    const maxAscent = lRasters.reduce((max, r) => r.ascent > max ? r.ascent : max, 0) / glyphRaster.sizeRatio;

    const posMin = getSourceStartPos(source, getSceneLinesNum(bounds, fontSize), scrollFraction);

    let x = bounds.xMin;
    let y = bounds.yMin;
    for (let i = posMin; i < source.text.length; i++) {
        let letter = source.text[i];
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
            baseline - r.ascent / glyphRaster.sizeRatio,
            x + r.w / glyphRaster.sizeRatio,
            baseline + r.descent / glyphRaster.sizeRatio,
        )
        vertices.push(...rectVertices);

        glyphTexPosition.push(...rect2d(
            r.x, r.baseline - r.ascent,
            r.x + r.w, r.baseline + r.descent,
        ));

        const color = codeColorization.colors[i] || [1, 1, 1];
        const verticesNum = rectVertices.length / vertexSize2d;
        colors.push(
            ...Array.from({length: verticesNum})
                .flatMap(() => color)
        );

        x += r.w / glyphRaster.sizeRatio;
    }

    return {vertices, glyphTexPosition, colors};
}

export type CodeSceneData = {
    // only x, y; z is left default = 0
    vertices: number[],
    // only x, y
    glyphTexPosition: number[],
    colors: number[],
}

