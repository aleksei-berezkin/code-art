import { createProgram } from './util/createProgram';
import vertexShaderSource from './shader/codeVertex.shader';
import fragmentShaderSource from './shader/codeFragment.shader';
import type { ImgParams } from './ImgParams';
import type { Mat4} from './util/matrices';
import { createCodeSceneData } from './createCodeSceneData';
import { vertexSize2d } from './util/rect';
import type { GlyphRaster } from './rasterizeFont';
import type { Source } from './souceCode';
import { uploadArrayToAttribute } from './util/uploadArrayToAttribute';
import { uploadTexture } from './util/uploadTexture';
import { Extensions, getSceneBounds, PixelSpace } from './PixelSpace';
import { colorizeCode } from './colorizeCode';
import type { ColorSchemeName } from './colorSchemes';
import { RGB, rgbSize } from './util/RGB';

export type CodeSceneDrawn = {
    pixelSpace: PixelSpace,
    extensions: Extensions,
    txMat: Mat4,
    bgColor: RGB,
}

// TODO render to texture
export function drawCodeScene(canvasEl: HTMLCanvasElement,
                              rasterCanvasEl: HTMLCanvasElement,
                              pixelSpace: PixelSpace,
                              extensions: Extensions,
                              // TODO params not orthogonal here
                              params: ImgParams,
                              txMat: Mat4,
                              source: Source,
                              glyphRaster: GlyphRaster,
): CodeSceneDrawn {
    const gl = canvasEl.getContext('webgl2');
    if (!gl) {
        throw new Error('webgl2 not supported');
    }

    const codeColorization = colorizeCode(source, params.color.scheme.val as ColorSchemeName);

    const sceneData = createCodeSceneData(
        getSceneBounds(pixelSpace, extensions),
        params.position.scroll.val / 100,
        params.font.size.val,
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
        pixelSpace,
        extensions,
        txMat,
        bgColor: codeColorization.bgColor,
    };
}
