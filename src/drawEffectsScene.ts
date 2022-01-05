import type { CodeSceneDrawn } from './drawCodeScene';
import vertexShaderSource from './shader/effectsVertex.shader';
import fragmentShaderSourceWithMacro from './shader/effectsFragment.shader';
import { createProgram } from './util/createProgram';
import { vertexSize2d } from './util/rect';
import { uploadArrayToAttribute } from './util/uploadArrayToAttribute';
import { uploadTexture } from './util/uploadTexture';
import {blurKernel, blurKernelSize, blurKernelWeight, gaussianBlurKernel, gaussianBlurKernelWeight} from './blurKernel';
import { createEffectsGrid } from './createEffectsGrid';
import type { ImgParams } from './ImgParams';
import {hexToRgb} from "./util/RGB";

const fragmentShaderSource = fragmentShaderSourceWithMacro
    .replaceAll('_BLUR_K_SZ_', String(blurKernelSize));

export function drawEffectsScene(canvasEl: HTMLCanvasElement, codeSceneDrawn: CodeSceneDrawn, imgParams: ImgParams) {
    const gl = canvasEl.getContext('webgl2')!;

    const program = createProgram(vertexShaderSource, fragmentShaderSource, gl);

    const gridVertices = createEffectsGrid(codeSceneDrawn.pixelSpace, codeSceneDrawn.extensions, imgParams['font size'].val);
    uploadArrayToAttribute('a_position', new Float32Array(gridVertices), vertexSize2d, program, gl);

    uploadTexture(canvasEl, gl.TEXTURE0, gl);

    gl.useProgram(program);

    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'u_tx'),
        false,
        codeSceneDrawn.txMat,
    );

    gl.uniform1f(gl.getUniformLocation(program, 'u_xMax'), codeSceneDrawn.pixelSpace.xMax);

    // noinspection JSSuspiciousNameCombination
    gl.uniform1f(gl.getUniformLocation(program, 'u_yMax'), codeSceneDrawn.pixelSpace.yMax);

    gl.uniform1f(gl.getUniformLocation(program, 'u_zBase'), codeSceneDrawn.pixelSpace.zBase);

    gl.uniform1f(gl.getUniformLocation(program, 'u_focalLength'), codeSceneDrawn.pixelSpace.optics.focalLength);

    gl.uniform1f(
        gl.getUniformLocation(program, 'u_distanceToSensor'),
        1 / (1 / codeSceneDrawn.pixelSpace.optics.focalLength - 1 / codeSceneDrawn.pixelSpace.zBase),
    );

    gl.uniform1f(gl.getUniformLocation(program, 'u_lensDiameter'), codeSceneDrawn.pixelSpace.optics.lensDiameter);

    gl.uniform3fv(gl.getUniformLocation(program, 'u_bg'), codeSceneDrawn.bgColor);

    gl.uniform1fv(gl.getUniformLocation(program, 'u_blurKernel'), gaussianBlurKernel);

    gl.uniform1f(gl.getUniformLocation(program, 'u_blurKernelWeight'), gaussianBlurKernelWeight);

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowRadius'), imgParams['font size'].val * imgParams['glow radius'].val / 200);

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowAmplification'), imgParams['glow amplification'].val);

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowColorShift'), imgParams['glow color shift'].val / 100);

    gl.uniform3fv(gl.getUniformLocation(program, 'u_glowShiftedColor'), hexToRgb(imgParams['glow shifted color'].val));

    gl.uniform1f(gl.getUniformLocation(program, 'u_colorAmplification'), imgParams['color amplification'].val);

    gl.uniform1f(gl.getUniformLocation(program, 'u_fade'), 10**imgParams['fade'].val);

    gl.uniform3fv(gl.getUniformLocation(program, 'u_fadeInDistortion'), hexToRgb(imgParams['fade in distortion'].val));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_fadeOutDistortion'), hexToRgb(imgParams['fade out distortion'].val));

    gl.uniform1f(gl.getUniformLocation(program, 'u_fadeDistortion'), imgParams['fade distortion'].val);

    gl.uniform1i(gl.getUniformLocation(program, 'u_mode'), 0);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, gridVertices.length / vertexSize2d);

    uploadTexture(canvasEl, gl.TEXTURE0, gl);

    gl.uniform1fv(gl.getUniformLocation(program, 'u_blurKernel'), blurKernel);

    gl.uniform1f(gl.getUniformLocation(program, 'u_blurKernelWeight'), blurKernelWeight);

    gl.uniform1i(gl.getUniformLocation(program, 'u_mode'), 1);

    gl.drawArrays(gl.TRIANGLES, 0, gridVertices.length / vertexSize2d);
}
