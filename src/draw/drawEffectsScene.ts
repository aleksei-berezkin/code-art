import type { CodeSceneDrawn } from './drawCodeScene';
import vertexShaderSource from '../shader/effectsVertex.shader';
import fragmentShaderSourceWithMacro from '../shader/effectsFragment.shader';
import { createProgram } from './createProgram';
import { vertexSize2d } from './rect';
import { uploadArrayToAttribute } from './uploadArrayToAttribute';
import { uploadTexture } from './uploadTexture';
import { createEffectsGrid } from './createEffectsGrid';
import type { ImgParams } from '../model/ImgParams';
import { hexToRgb } from '../model/RGB';
import { getSliderVal } from '../model/ImgParams';

// TODO calculate based on input data
const glowKSz = 11;
const blurKSz = 15;

const fragmentShaderSource = fragmentShaderSourceWithMacro
    .replaceAll('_GLOW_K_SZ_', String(glowKSz))
    .replaceAll('_BLUR_K_SZ_', String(blurKSz))
    .replaceAll('_MAX_K_SZ_', String(Math.max(glowKSz, blurKSz)));

export function drawEffectsScene(canvasEl: HTMLCanvasElement, codeSceneDrawn: CodeSceneDrawn, imgParams: ImgParams) {
    const gl = canvasEl.getContext('webgl2')!;

    const program = createProgram(vertexShaderSource, fragmentShaderSource, gl);

    const gridVertices = createEffectsGrid(codeSceneDrawn.pixelSpace, codeSceneDrawn.extensions, imgParams.font.size.val);
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

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowRadius'), getSliderVal(imgParams.font.size) * getSliderVal(imgParams.glow.radius) / 2);

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowBrightness'), getSliderVal(imgParams.glow.brightness));

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowColorShift'), getSliderVal(imgParams.glow.recolor));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_glowShiftedColor'), hexToRgb(imgParams.glow.to.val));

    gl.uniform1f(gl.getUniformLocation(program, 'u_colorBrightness'), getSliderVal(imgParams.color.brightness));

    gl.uniform1f(gl.getUniformLocation(program, 'u_fade'), getSliderVal(imgParams.fade.fade));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_fadeNearColor'), hexToRgb(imgParams.fade.near.val));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_fadeFarColor'), hexToRgb(imgParams.fade.far.val));

    gl.uniform1f(gl.getUniformLocation(program, 'u_fadeRecolor'), getSliderVal(imgParams.fade.recolor));

    gl.uniform1i(gl.getUniformLocation(program, 'u_mode'), 0);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, gridVertices.length / vertexSize2d);

    uploadTexture(canvasEl, gl.TEXTURE0, gl);

    gl.uniform1i(gl.getUniformLocation(program, 'u_mode'), 1);

    gl.drawArrays(gl.TRIANGLES, 0, gridVertices.length / vertexSize2d);
}
