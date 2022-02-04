import { rect2d, rect2dVerticesNum } from './rect';
import type { GlyphRaster } from './rasterizeFont';
import type { Source } from '../model/souceCode';
import { iterateCode } from '../model/iterateCode';
import type { ColorScheme } from '../model/colorSchemes';
import { shortColorKeyToColorKey } from '../model/shortColorKeyToColorKey';
import type { CodeColorization } from '../model/highlightProtocol';
import type { Mat4 } from '../util/matrices';
import { applyTx } from '../util/applyTx';
import { isVisibleInClipSpace } from '../util/isVisibleInClipSpace';
import type { SceneBounds } from '../model/SceneBounds';
import { createWorkLimiter } from '../util/workLimiter';
import type { ScrollFraction } from '../model/Scroll';

export type CodeSceneData = {
    // only x, y; z is left default = 0
    vertices: number[],
    // only x, y
    glyphTexPosition: number[],
    // RGB
    colors: number[],
}

export async function createCodeSceneData(
    bounds: SceneBounds,
    txMat: Mat4,
    scrollFraction: ScrollFraction,
    fontSize: number,
    source: Source,
    colorScheme: ColorScheme,
    codeColorization: CodeColorization,
    glyphRaster: GlyphRaster,
): Promise<CodeSceneData> {
    const vertices = [];
    const glyphTexPosition = [];
    const colors = [];

    const workLimiter = createWorkLimiter();

    for (const codeLetter of iterateCode(bounds, scrollFraction, fontSize, source, glyphRaster)) {
        await workLimiter.next();

        const {pos, letter, x, baseline} = codeLetter;
        const m = glyphRaster.glyphs.get(letter)!;

        const x1 = x;
        const y1 = baseline - m.ascent / glyphRaster.sizeRatio;
        const x2 = x + m.w / glyphRaster.sizeRatio;
        const y2 = baseline + m.descent / glyphRaster.sizeRatio;

        if (!isVisible(txMat, x1, y1, x2, y2)) {
            continue;
        }

        vertices.push(...rect2d(x1, y1, x2, y2));

        glyphTexPosition.push(...rect2d(
            m.x, m.baseline - m.ascent,
            m.x + m.w, m.baseline + m.descent,
        ));

        const color = colorScheme[shortColorKeyToColorKey[codeColorization[pos]]]
            ?? colorScheme.default;
        colors.push(
            ...Array.from({length: rect2dVerticesNum})
                .flatMap(() => color)
        );

    }

    return {vertices, glyphTexPosition, colors};
}

function isVisible(txMat: Mat4, x1: number, y1: number, x2: number, y2: number) {
    return [[x1, y1], [x1, y2], [x2, y1], [x2, y2]]
        .some(([x, y]) => {
            const [_x, _y] = applyTx(txMat, x, y);
            return isVisibleInClipSpace(_x, _y);
        });
}
