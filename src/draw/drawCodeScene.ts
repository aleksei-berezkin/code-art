import { createProgram } from './createProgram';
import vertexShaderSource from '../shader/codeVertex.shader';
import fragmentShaderSource from '../shader/codeFragment.shader';
import { createCodeSceneData } from './createCodeSceneData';
import { vertexSize2d } from './rect';
import type { Source } from '../model/Source';
import { uploadArrayToAttribute } from './uploadArrayToAttribute';
import { createEmptyTexture, uploadTexture } from './uploadTexture';
import { rgbSize } from '../model/RGB';
import type { SceneParams } from '../model/generateSceneParams';
import { renderColorToTexture } from './renderColorToTexture';
import type { ColorScheme } from '../model/colorSchemes';
import { getSceneBounds } from '../model/SceneBounds';
import { getScrollFraction } from '../model/ScrollFraction';
import type { WorkLimiter } from '../util/workLimiter';
import type { GlyphRaster } from '../model/GlyphRaster';
import type { ParseResult } from '../model/ParseResult';
import { dpr } from '../util/dpr';

// Renders to 0 tex unit
export async function drawCodeScene(
    source: Source,
    colorScheme: ColorScheme,
    parseResult: ParseResult,
    sceneParams: SceneParams,
    glyphRaster: GlyphRaster,
    codeCanvasEl: HTMLCanvasElement,
    rasterCanvasEl: HTMLCanvasElement,
    workLimiter: WorkLimiter,
) {
    const gl = codeCanvasEl.getContext('webgl2', {preserveDrawingBuffer: true});
    if (!gl) {
        throw new Error('webgl2 not supported');
    }

    const sceneData = await createCodeSceneData(
        getSceneBounds(sceneParams.pixelSpace, sceneParams.extensions),
        sceneParams.txMat,
        getScrollFraction(sceneParams.imgParams),
        sceneParams.imgParams.font.size.val,
        source,
        colorScheme,
        parseResult,
        glyphRaster,
        workLimiter,
    );

    const program = await createProgram(vertexShaderSource, fragmentShaderSource, gl);

    const verticesArray = new Float32Array(sceneData.vertices);
    uploadArrayToAttribute('a_position', verticesArray, vertexSize2d, program, gl);

    uploadArrayToAttribute('a_glyphTexPosition', new Float32Array(sceneData.glyphTexPosition), vertexSize2d, program, gl);

    uploadArrayToAttribute('a_color', new Float32Array(sceneData.colors), rgbSize, program, gl);

    uploadTexture(1, rasterCanvasEl, gl);

    gl.useProgram(program);

    gl.uniform1i(gl.getUniformLocation(program, 'u_letters'), 1);

    gl.uniform1f(gl.getUniformLocation(program, 'u_lettersTexRatio'), glyphRaster.fontSizeRatio / dpr);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_tx'), false, sceneParams.txMat);

    gl.uniform3fv(gl.getUniformLocation(program, 'u_bg'), colorScheme.background);

    const targetTex = createEmptyTexture(0, {w: codeCanvasEl.width, h: codeCanvasEl.height}, gl)
    renderColorToTexture(targetTex, gl);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(...colorScheme.background, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, sceneData.vertices.length / vertexSize2d);

    return targetTex;
}
