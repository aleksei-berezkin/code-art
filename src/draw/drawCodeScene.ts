import { createProgram } from './createProgram';
import vertexShaderSource from '../shader/codeVertex.shader';
import fragmentShaderSource from '../shader/codeFragment.shader';
import { createCodeSceneData } from './createCodeSceneData';
import { vertexSize2d } from './rect';
import type { GlyphRaster } from './rasterizeFont';
import type { Source } from '../model/souceCode';
import { uploadArrayToAttribute } from './uploadArrayToAttribute';
import { uploadTexture } from './uploadTexture';
import { getSceneBounds } from '../model/PixelSpace';
import type { CodeColorization } from '../model/colorizeCode';
import { rgbSize } from '../model/RGB';
import { getSliderVal } from '../model/ImgParams';
import type { SceneParams } from '../model/generateSceneParams';

// TODO render to texture
export function drawCodeScene(source: Source,
                              codeColorization: CodeColorization,
                              sceneParams: SceneParams,
                              glyphRaster: GlyphRaster,
                              codeCanvasEl: HTMLCanvasElement,
                              rasterCanvasEl: HTMLCanvasElement,
) {
    const gl = codeCanvasEl.getContext('webgl2');
    if (!gl) {
        throw new Error('webgl2 not supported');
    }

    const sceneData = createCodeSceneData(
        getSceneBounds(sceneParams.pixelSpace, sceneParams.extensions),
        getSliderVal(sceneParams.imgParams.position.scroll),
        sceneParams.imgParams.font.size.val,
        source,
        codeColorization,
        glyphRaster,
    );

    const program = createProgram(vertexShaderSource, fragmentShaderSource, gl);

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

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'u_tx'),
        false,
        sceneParams.txMat,
    );

    gl.uniform3fv(
        gl.getUniformLocation(program, 'u_bg'),
        codeColorization.bgColor,
    );

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(...codeColorization.bgColor, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, sceneData.vertices.length / vertexSize2d);
}
