import { createProgram } from './createProgram';
import vertexShaderSource from '../shader/codeVertex.shader';
import fragmentShaderSource from '../shader/codeFragment.shader';
import { createCodeSceneData } from './createCodeSceneData';
import { vertexSize2d } from './rect';
import type { GlyphRaster } from './rasterizeFont';
import type { Source } from '../model/souceCode';
import { uploadArrayToAttribute } from './uploadArrayToAttribute';
import { createEmptyTexture, uploadTexture } from './uploadTexture';
import { rgbSize } from '../model/RGB';
import { getSliderVal } from '../model/ImgParams';
import type { SceneParams } from '../model/generateSceneParams';
import { renderColorToTexture } from './renderColorToTexture';
import type { ColorScheme } from '../model/colorSchemes';
import type { CodeColorization } from '../model/highlightProtocol';
import { getSceneBounds } from '../model/SceneBounds';

// Renders to 0 tex unit
export async function drawCodeScene(
    source: Source,
    colorScheme: ColorScheme,
    codeColorization: CodeColorization,
    sceneParams: SceneParams,
    glyphRaster: GlyphRaster,
    codeCanvasEl: HTMLCanvasElement,
    rasterCanvasEl: HTMLCanvasElement,
) {
    const gl = codeCanvasEl.getContext('webgl2', {preserveDrawingBuffer: true});
    if (!gl) {
        throw new Error('webgl2 not supported');
    }

    const scrollFraction = {
        v: getSliderVal(sceneParams.imgParams.scroll.v),
        h: getSliderVal(sceneParams.imgParams.scroll.h),
    };

    const sceneData = await createCodeSceneData(
        getSceneBounds(sceneParams.pixelSpace, sceneParams.extensions),
        sceneParams.txMat,
        scrollFraction,
        sceneParams.imgParams.font.size.val,
        source,
        colorScheme,
        codeColorization,
        glyphRaster,
    );

    const program = await createProgram(vertexShaderSource, fragmentShaderSource, gl);

    const verticesArray = new Float32Array(sceneData.vertices);
    uploadArrayToAttribute('a_position', verticesArray, vertexSize2d, program, gl);

    uploadArrayToAttribute('a_glyphTexPosition', new Float32Array(sceneData.glyphTexPosition), vertexSize2d, program, gl);

    uploadArrayToAttribute('a_color', new Float32Array(sceneData.colors), rgbSize, program, gl);

    uploadTexture(1, rasterCanvasEl, gl);

    gl.useProgram(program);

    gl.uniform1i(
        gl.getUniformLocation(program, 'u_letters'),
        1,
    );

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'u_tx'),
        false,
        sceneParams.txMat,
    );

    gl.uniform3fv(
        gl.getUniformLocation(program, 'u_bg'),
        colorScheme.background,
    );

    const targetTex = createEmptyTexture(0, {w: codeCanvasEl.width, h: codeCanvasEl.height}, gl)
    renderColorToTexture(targetTex, gl);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(...colorScheme.background, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, sceneData.vertices.length / vertexSize2d);

    return targetTex;
}
