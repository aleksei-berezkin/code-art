import { createProgram } from './createProgram';
import vertexShaderSource from '../shader/codeVertex.shader';
import fragmentShaderSource from '../shader/codeFragment.shader';
import { createCodeSceneVertices } from './createCodeSceneVertices';
import { rect2dVertexSize } from './rect';
import type { Source } from '../model/Source';
import { createUploadToAttribute } from './uploadArrayToAttribute';
import { createEmptyTexture, uploadTexture } from './uploadTexture';
import { rgbSize } from '../model/RGB';
import type { SceneParams } from '../model/generateSceneParams';
import { renderColorToTexture } from './renderColorToTexture';
import type { ColorScheme } from '../model/colorSchemes';
import { getSceneBounds } from '../model/SceneBounds';
import { getScrollFraction } from '../model/ScrollFraction';
import type { WorkLimiter } from '../util/workLimiter';
import type { AlphabetRaster } from '../model/AlphabetRaster';
import type { ParseResult } from '../model/ParseResult';
import { dpr } from '../util/dpr';

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
) {
    const gl = codeCanvasEl.getContext('webgl2', {preserveDrawingBuffer: true});
    if (!gl) {
        throw new Error('webgl2 not supported');
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

    for await (const vertices of createCodeSceneVertices(
        getSceneBounds(sceneParams.pixelSpace, sceneParams.extensions),
        sceneParams.txMat,
        getScrollFraction(sceneParams.imgParams),
        sceneParams.imgParams.font.size.val,
        source,
        colorScheme,
        parseResult,
        alphabetRaster,
        workLimiter,
    )) {
        uploadToPosition(vertices.position);
        uploadToGlyphTexPosition(vertices.glyphTexPosition);
        uploadToColor(vertices.color);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.verticesNum);
    }


    return targetTex;
}
