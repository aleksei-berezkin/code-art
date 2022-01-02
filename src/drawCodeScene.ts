import { createProgram } from './util/createProgram';
import vertexShaderSource from './shader/codeVertex.shader';
import fragmentShaderSource from './shader/codeFragment.shader';
import type { Transformations } from './Transformations';
import { asMat4, getRotateXMat, getRotateYMat, getRotateZMat, getTranslateMat, Mat4, mul } from './util/matrices';
import { createCodeSceneData } from './createCodeSceneData';
import { vertexSize2d } from './util/rect';
import type { GlyphRaster } from './rasterizeFont';
import type { Source } from './getSource';
import { RGB, rgbSize } from './ColorScheme';
import type { CodeColorization } from './colorizeCode';
import { uploadArrayToAttribute } from './util/uploadArrayToAttribute';
import { uploadTexture } from './util/uploadTexture';
import { calcExtensions, Extensions, getSceneBounds, makePixelSpace, PixelSpace } from './PixelSpace';
import { dpr } from './util/dpr';

export type CodeSceneDrawn = {
    pixelSpace: PixelSpace,
    extensions: Extensions,
    txMat: Mat4,
    bgColor: RGB,
}

// TODO render to texture
export function drawCodeScene(canvasEl: HTMLCanvasElement,
                              rasterCanvasEl: HTMLCanvasElement,
                              tfs: Transformations,
                              source: Source,
                              codeColorization: CodeColorization,
                              glyphRaster: GlyphRaster,
): CodeSceneDrawn {
    const gl = canvasEl.getContext('webgl2');
    if (!gl) {
        throw new Error('webgl2 not supported');
    }

    const program = createProgram(vertexShaderSource, fragmentShaderSource, gl);

    const pSp = makePixelSpace(canvasEl.width / dpr, canvasEl.height / dpr);

    const xRotAngle = -tfs['angle x'].val;
    const yRotAngle = -tfs['angle y'].val;
    const zRotAngle = tfs['angle z'].val;

    const extensions = calcExtensions(pSp, xRotAngle, yRotAngle, zRotAngle);

    const sceneData = createCodeSceneData(
        getSceneBounds(pSp, extensions),
        tfs.scroll.val / 100,
        tfs['font size'].val,
        source,
        codeColorization,
        glyphRaster,
    );

    const verticesArray = new Float32Array(sceneData.vertices);
    uploadArrayToAttribute('a_position', verticesArray, vertexSize2d, program, gl);

    uploadArrayToAttribute('a_glyphTexPosition', new Float32Array(sceneData.glyphTexPosition), vertexSize2d, program, gl);

    uploadArrayToAttribute('a_color', new Float32Array(sceneData.colors), rgbSize, program, gl);

    uploadTexture(rasterCanvasEl, gl.TEXTURE0, gl);

    gl.useProgram(program);

    gl.uniform1i(
        gl.getUniformLocation(program, 'u_letters'),
        0,
    );

    // Transform in pixel space
    const txMatPixels =
        mul(
            getTranslateMat(
                tfs['translate x'].val / 100 * pSp.w,
                tfs['translate y'].val / 100 * pSp.h,
                tfs['translate z'].val / 100 * pSp.zBase,
            ),
            getRotateXMat(xRotAngle),
            getRotateYMat(yRotAngle),
            getRotateZMat(zRotAngle),
        );

    // Pixel space to clip space
    const toClipSpaceMat = asMat4([
        // xMin(==-xMax) ... xMax -> -1 ... +1
        1 / pSp.xMax, 0, 0, 0,
        // yMin(==-yMax) ... yMax -> +1 ... -1
        0, -1 / pSp.yMax, 0, 0,
        // zMin ... zMax -> -1 ... +1 (won't be divided by w)
        0, 0, 2 / pSp.zSpan, -1 - 2 * pSp.zMin / pSp.zSpan,
        // zMin(==-zBase)...0...zBase...zMax -> 0...+1...+2...(zSpan/zBase)
        0, 0, 1 / pSp.zBase, 1,
    ]);

    const txMat = mul(toClipSpaceMat, txMatPixels);

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'u_tx'),
        false,
        txMat,
    );

    gl.uniform3fv(
        gl.getUniformLocation(program, 'u_bg'),
        codeColorization.bgColor,
    );

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(...codeColorization.bgColor, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, sceneData.vertices.length / vertexSize2d);

    return {
        pixelSpace: pSp,
        extensions,
        txMat,
        bgColor: codeColorization.bgColor,
    };
}
