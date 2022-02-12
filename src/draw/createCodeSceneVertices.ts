import { setRect2d, rect2dVerticesNum, rect2dVertexSize } from './rect';
import type { Source } from '../model/Source';
import { iterateCode } from '../model/iterateCode';
import type { ColorScheme } from '../model/colorSchemes';
import { shortColorKeyToColorKey } from '../model/shortColorKeyToColorKey';
import type { Mat4 } from '../util/matrices';
import { applyTx } from '../util/applyTx';
import { isVisibleInClipSpace } from '../util/isVisibleInClipSpace';
import type { SceneBounds } from '../model/SceneBounds';
import type { WorkLimiter } from '../util/workLimiter';
import type { ScrollFraction } from '../model/ScrollFraction';
import type { GlyphRaster } from '../model/GlyphRaster';
import type { ParseResult } from '../model/ParseResult';
import { dpr } from '../util/dpr';
import { RGB, rgbSize } from '../model/RGB';

export type CodeSceneVertices = {
    // only (x, y); z is always = 0
    position: Float32Array,
    // only (x, y)
    glyphTexPosition: Float32Array,
    // RGB
    color: Float32Array,
    verticesNum: number,
}

const verticesInArray = 100 * rect2dVerticesNum;

export async function* createCodeSceneVertices(
    bounds: SceneBounds,
    txMat: Mat4,
    scrollFraction: ScrollFraction,
    fontSize: number,
    source: Source,
    colorScheme: ColorScheme,
    parseResult: ParseResult,
    glyphRaster: GlyphRaster,
    workLimiter: WorkLimiter,
): AsyncGenerator<CodeSceneVertices> {
    // Same object reused
    const v: CodeSceneVertices = {
        position: new Float32Array(verticesInArray * rect2dVertexSize),
        glyphTexPosition: new Float32Array(verticesInArray * rect2dVertexSize),
        color: new Float32Array(verticesInArray * rgbSize),
        verticesNum: 0,
    };

    for (const codeLetter of iterateCode(bounds, scrollFraction, fontSize, source, glyphRaster)) {
        await workLimiter.next();

        const {pos, letter, x, baseline} = codeLetter;
        const m = glyphRaster.glyphs.get(letter)!;

        const ascent = Math.min(m.ascent + dpr, glyphRaster.maxAscent);
        const descent = Math.min(m.descent + dpr, glyphRaster.maxDescent);

        const x1 = x;
        const y1 = baseline - ascent / glyphRaster.fontSizeRatio;
        const x2 = x + m.w / glyphRaster.fontSizeRatio;
        const y2 = baseline + descent / glyphRaster.fontSizeRatio;

        if (!isVisible(txMat, x1, y1, x2, y2)) {
            continue;
        }

        setRect2d(v.position, v.verticesNum * rect2dVertexSize, x1, y1, x2, y2);

        setRect2d(v.glyphTexPosition, v.verticesNum * rect2dVertexSize,
            m.x, m.baseline - ascent,
            m.x + m.w, m.baseline + descent,
        );

        const _color = colorScheme[shortColorKeyToColorKey[parseResult.colorization[pos]]]
            ?? colorScheme.default;
        setColor(v.color, v.verticesNum * rgbSize, _color);

        v.verticesNum += rect2dVerticesNum;
        if (v.verticesNum === verticesInArray) {
            yield v;
            v.verticesNum = 0;
        }
    }

    if (v.verticesNum) {
        yield v;
    }
}

function isVisible(txMat: Mat4, x1: number, y1: number, x2: number, y2: number) {
    return [[x1, y1], [x1, y2], [x2, y1], [x2, y2]]
        .some(([x, y]) => {
            const [_x, _y] = applyTx(txMat, x, y);
            return isVisibleInClipSpace(_x, _y);
        });
}

function setColor(a: Float32Array, from: number, color: RGB) {
    for (let i = 0; i < rect2dVerticesNum; i++) {
        a.set(color, from + i * rgbSize);
    }
}
