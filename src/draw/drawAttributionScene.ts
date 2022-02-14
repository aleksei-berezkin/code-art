import type { SceneParams } from '../model/generateSceneParams';
import vertexShaderSource from '../shader/attributionVertex.shader';
import fragmentShaderSource from '../shader/attributionFragment.shader';
import { createProgram } from './createProgram';
import { uploadTexture } from './uploadTexture';
import { uploadArrayToAttribute } from './uploadArrayToAttribute';
import { renderToCanvas } from './renderColorToTexture';
import type { ColorScheme } from '../model/colorSchemes';

export async function drawAttributionScene(
    sceneParams: SceneParams,
    mainTexture: WebGLTexture,
    colorScheme: ColorScheme,
    codeCanvasEl: HTMLCanvasElement,
    attributionCanvasEl: HTMLCanvasElement,
) {
    const gl = codeCanvasEl.getContext('webgl2')!;

    const prog = await createProgram(vertexShaderSource, fragmentShaderSource, gl);

    uploadArrayToAttribute('a_position', new Float32Array([1, 1,   1, -1,   -1, 1,   -1, -1]), 2, prog, gl);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mainTexture);

    uploadTexture(1, attributionCanvasEl, gl);

    gl.useProgram(prog);

    gl.uniform1i(gl.getUniformLocation(prog, 'u_main'), 0);

    gl.uniform1i(gl.getUniformLocation(prog, 'u_attr'), 1);

    gl.uniform2fv(gl.getUniformLocation(prog, 'u_mainSizePx'), [codeCanvasEl.width, codeCanvasEl.height]);
    gl.uniform2fv(gl.getUniformLocation(prog, 'u_attrFromPx'), [codeCanvasEl.width - attributionCanvasEl.width, attributionCanvasEl.height]);
    gl.uniform2fv(gl.getUniformLocation(prog, 'u_attrSizePx'), [attributionCanvasEl.width, attributionCanvasEl.height]);
    gl.uniform3fv(gl.getUniformLocation(prog, 'u_bg'), colorScheme.background);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    renderToCanvas(gl);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
