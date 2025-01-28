import { setRect2d, rect2dVerticesNum, rect2dVertexSize } from './rect';
import type { Source } from '../model/Source';
import { iterateCode } from '../model/iterateCode';
import type { ColorScheme } from '../model/colorSchemes';
import { shortColorKeyToColorKey } from '../model/shortColorKeyToColorKey';
import type { Mat4 } from '../util/matrices';
import { applyTx } from '../util/applyTx';
import { isVisibleInClipSpace } from '../util/isVisibleInClipSpace';
import type { WorkLimiter } from '../util/workLimiter';
import type { ScrollFraction } from '../model/ScrollFraction';
import type { AlphabetRaster } from '../model/AlphabetRaster';
import type { ParseResult } from '../model/ParseResult';
import { dpr } from '../util/dpr';
import { type RGB, rgbSize } from '../model/RGB';
import type { PixelSpace } from '../model/PixelSpace';
import type { Extensions } from '../model/Extensions';
import type { SceneBounds } from '../model/SceneBounds';

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
    pixelSpace: PixelSpace,
    extensions: Extensions,
    txMat: Mat4,
    scrollFraction: ScrollFraction,
    fontSize: number,
    source: Source,
    colorScheme: ColorScheme,
    parseResult: ParseResult,
    alphabetRaster: AlphabetRaster,
    workLimiter: WorkLimiter,
    setRealTextBounds: (b: SceneBounds) => void,
): AsyncGenerator<CodeSceneVertices> {
    // Same object reused
    const v: CodeSceneVertices = {
        position: new Float32Array(verticesInArray * rect2dVertexSize),
        glyphTexPosition: new Float32Array(verticesInArray * rect2dVertexSize),
        color: new Float32Array(verticesInArray * rgbSize),
        verticesNum: 0,
    };

    const realTextBounds = {
        xMin: pixelSpace.xMin,
        xMax: pixelSpace.xMax,
        yMin: pixelSpace.yMin,
        yMax: pixelSpace.yMax,
    };

    for (const codeLetter of iterateCode(pixelSpace, extensions, scrollFraction, fontSize, source, alphabetRaster)) {
        await workLimiter.next();

        const {pos, letter, x, baseline} = codeLetter;
        const m = alphabetRaster.glyphs.get(letter)!;

        const ascent = Math.min(m.ascent + dpr(), alphabetRaster.maxAscent);
        const descent = Math.min(m.descent + dpr(), alphabetRaster.maxDescent);

        const x1 = x;
        const y1 = baseline - ascent / alphabetRaster.fontSizeRatio;
        const x2 = x + m.w / alphabetRaster.fontSizeRatio;
        const y2 = baseline + descent / alphabetRaster.fontSizeRatio;

        if (!isVisible(txMat, x1, y1, x2, y2)) {
            continue;
        }

        if (x1 < realTextBounds.xMin) realTextBounds.xMin = x1;
        if (x2 > realTextBounds.xMax) realTextBounds.xMax = x2;
        if (y1 < realTextBounds.yMin) realTextBounds.yMin = y1;
        if (y2 > realTextBounds.yMax) realTextBounds.yMax = y2;

        setRect2d(v.position, v.verticesNum * rect2dVertexSize, x1, y1, x2, y2);

        setRect2d(v.glyphTexPosition, v.verticesNum * rect2dVertexSize,
            m.x, m.baseline - ascent,
            m.x + m.w, m.baseline + descent,
        );

        const _color = colorScheme[shortColorKeyToColorKey[parseResult.colorization[pos]]]
            || colorScheme.default;
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

    // Because cannot capture generator return value with for-await
    setRealTextBounds(realTextBounds);
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
