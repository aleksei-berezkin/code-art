import { createProgram } from './createProgram';
import vertexShaderSource from '../shader/codeVertex.shader';
import fragmentShaderSource from '../shader/codeFragment.shader';
import { createCodeSceneVertices } from './createCodeSceneVertices';
import { rect2dVertexSize } from './rect';
import type { Source } from '../model/Source';
import { createUploadToAttribute } from './createUploadToAttribute';
import { createEmptyTexture, uploadTexture } from './uploadTexture';
import { rgbSize } from '../model/RGB';
import type { SceneParams } from '../model/generateSceneParams';
import { renderColorToTexture } from './renderColorToTexture';
import type { ColorScheme } from '../model/colorSchemes';
import { getScrollFraction } from '../model/ScrollFraction';
import type { WorkLimiter } from '../util/workLimiter';
import type { AlphabetRaster } from '../model/AlphabetRaster';
import type { ParseResult } from '../model/ParseResult';
import { dpr } from '../util/dpr';
import type { DrawCodeResult } from './DrawCodeResult';

// Renders to 0 tex unit
export async function drawCodeScene(
    source: Source,
    colorScheme: ColorScheme,
    parseResult: ParseResult,
    sceneParams: SceneParams,
    alphabetRaster: AlphabetRaster,
    codeCanvasEl: HTMLCanvasElement,
    alphabetCanvasEl: HTMLCanvasElement,
    workLimiter: WorkLimiter,
): Promise<DrawCodeResult> {
    const gl = codeCanvasEl.getContext('webgl2', {preserveDrawingBuffer: true});
    if (!gl) {
        const msg = 'WebGL2 is not supported'
        window.showStub(msg);
        throw new Error(msg);
    }

    const program = await createProgram(vertexShaderSource, fragmentShaderSource, gl);

    uploadTexture(1, alphabetCanvasEl, gl);

    gl.useProgram(program);

    gl.uniform1i(gl.getUniformLocation(program, 'u_letters'), 1);

    gl.uniform1f(gl.getUniformLocation(program, 'u_lettersTexRatio'), alphabetRaster.fontSizeRatio / dpr);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_tx'), false, sceneParams.txMat);

    gl.uniform3fv(gl.getUniformLocation(program, 'u_bg'), colorScheme.background);

    const targetTex = createEmptyTexture(0, {w: codeCanvasEl.width, h: codeCanvasEl.height}, gl)
    renderColorToTexture(targetTex, gl);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(...colorScheme.background, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const uploadToPosition = createUploadToAttribute('a_position', rect2dVertexSize, program, gl);
    const uploadToGlyphTexPosition = createUploadToAttribute('a_glyphTexPosition', rect2dVertexSize, program, gl);
    const uploadToColor = createUploadToAttribute('a_color', rgbSize, program, gl);

    let realTextBounds;
    for await (const vertices of createCodeSceneVertices(
        sceneParams.pixelSpace,
        sceneParams.extensions,
        sceneParams.txMat,
        getScrollFraction(sceneParams.imgParams),
        sceneParams.imgParams.font.size.val,
        source,
        colorScheme,
        parseResult,
        alphabetRaster,
        workLimiter,
        b => realTextBounds = b,
    )) {
        uploadToPosition(vertices.position);
        uploadToGlyphTexPosition(vertices.glyphTexPosition);
        uploadToColor(vertices.color);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.verticesNum);
    }

    if (!realTextBounds) throw new Error('Text bounds not set');

    return {
        targetTex,
        realTextBounds,
    };
}
