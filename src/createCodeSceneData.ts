import { rect2d, vertexSize2d } from './util/rect';
import type { GlyphRaster } from './rasterizeFont';
import type { Source } from './souceCode';
import type { CodeColorization } from './colorizeCode';
import type { SceneBounds } from './PixelSpace';
import { iterateCode } from './iterateCode';

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
    for (const codeLetter of iterateCode(bounds, scrollFraction, fontSize, source, glyphRaster)) {
        const {pos, letter, x, baseline} = codeLetter;
        const m = glyphRaster.glyphs.get(letter)!;
        const rectVertices = rect2d(
            x,
            baseline - m.ascent / glyphRaster.sizeRatio,
            x + m.w / glyphRaster.sizeRatio,
            baseline + m.descent / glyphRaster.sizeRatio,
        )
        vertices.push(...rectVertices);

        glyphTexPosition.push(...rect2d(
            m.x, m.baseline - m.ascent,
            m.x + m.w, m.baseline + m.descent,
        ));

        const color = codeColorization.colors[pos] || [1, 1, 1];
        const verticesNum = rectVertices.length / vertexSize2d;
        colors.push(
            ...Array.from({length: verticesNum})
                .flatMap(() => color)
        );
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
