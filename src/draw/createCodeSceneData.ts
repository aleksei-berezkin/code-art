import { rect2d, vertexSize2d } from './rect';
import type { GlyphRaster } from './rasterizeFont';
import type { Source } from '../model/souceCode';
import type { SceneBounds } from '../model/PixelSpace';
import { iterateCode } from '../model/iterateCode';
import { delay } from '../util/delay';
import type { ColorScheme } from '../model/colorSchemes';
import { shortColorKeyToColorKey } from '../model/shortColorKeyToColorKey';
import type { CodeColorization } from '../model/highlightProtocol';

const pauseEvery = 1200;

export async function createCodeSceneData(
    bounds: SceneBounds,
    scrollFraction: number,
    fontSize: number,
    source: Source,
    colorScheme: ColorScheme,
    codeColorization: CodeColorization,
    glyphRaster: GlyphRaster,
): Promise<CodeSceneData> {
    const vertices = [];
    const glyphTexPosition = [];
    const colors = [];

    let cnt = 0;
    for (const codeLetter of iterateCode(bounds, scrollFraction, fontSize, source, glyphRaster)) {
        if (cnt++ % pauseEvery === 0) {
            await delay(4)
        }

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

        const color = colorScheme[shortColorKeyToColorKey[codeColorization[pos]]]
            ?? colorScheme.default;
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
