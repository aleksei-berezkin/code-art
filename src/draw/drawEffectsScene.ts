import vertexShaderSource from '../shader/effectsVertex.shader';
import fragmentShaderSource from '../shader/effectsFragment.shader';
import { createProgram } from './createProgram';
import { vertexSize2d } from './rect';
import { uploadArrayToAttribute } from './uploadArrayToAttribute';
import { createEmptyTexture } from './uploadTexture';
import { createEffectsGrid } from './createEffectsGrid';
import { hexToRgb, RGB } from '../model/RGB';
import { getSliderVal } from '../model/ImgParams';
import { ceilToOdd } from '../util/ceilToOdd';
import { getLoopSize } from './getLoopSize';
import { dpr } from '../util/dpr';
import type { SceneParams } from '../model/generateSceneParams';
import { renderColorToTexture, renderToCanvas } from './renderColorToTexture';
import { drawTriangles } from './drawTriangles';

const maxKernel = 21;

export async function drawEffectsScene(
    sceneParams: SceneParams,
    bgColor: RGB,
    inputTexture: WebGLTexture,
    codeCanvasEl: HTMLCanvasElement,
) {
    const gl = codeCanvasEl.getContext('webgl2', {preserveDrawingBuffer: true})!;

    const { imgParams } = sceneParams;
    const glowRadius = getSliderVal(imgParams.font.size) * getSliderVal(imgParams.glow.radius) / 2;
    const glowKSize = ceilToOdd(glowRadius / 2 * dpr, maxKernel);
    const blurKSize = ceilToOdd(3 * imgParams.fade.blur.val * dpr, maxKernel);
    const loopSize = getLoopSize(glowKSize, blurKSize, maxKernel);

    const fragmentShaderSourceProcessed = fragmentShaderSource
        .replaceAll('_LOOP_SZ_', String(loopSize))

    const program = createProgram(vertexShaderSource, fragmentShaderSourceProcessed, gl);

    const gridVertices = createEffectsGrid(sceneParams.pixelSpace, sceneParams.extensions, imgParams.font.size.val);
    uploadArrayToAttribute('a_position', new Float32Array(gridVertices), vertexSize2d, program, gl);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);

    gl.useProgram(program);

    gl.uniform1i(gl.getUniformLocation(program, 'u_glowKSize'), glowKSize);

    gl.uniform1i(gl.getUniformLocation(program, 'u_blurKSize'), blurKSize);

    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 1);

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'u_tx'),
        false,
        sceneParams.txMat,
    );

    gl.uniform1f(gl.getUniformLocation(program, 'u_xMax'), sceneParams.pixelSpace.xMax);

    // noinspection JSSuspiciousNameCombination
    gl.uniform1f(gl.getUniformLocation(program, 'u_yMax'), sceneParams.pixelSpace.yMax);

    gl.uniform1f(gl.getUniformLocation(program, 'u_zBase'), sceneParams.pixelSpace.zBase);

    gl.uniform1f(gl.getUniformLocation(program, 'u_focalLength'), sceneParams.pixelSpace.optics.focalLength);

    gl.uniform1f(
        gl.getUniformLocation(program, 'u_distanceToSensor'),
        1 / (1 / sceneParams.pixelSpace.optics.focalLength - 1 / sceneParams.pixelSpace.zBase),
    );

    gl.uniform1f(gl.getUniformLocation(program, 'u_lensDiameter'), sceneParams.pixelSpace.optics.lensDiameter);

    gl.uniform3fv(gl.getUniformLocation(program, 'u_bg'), bgColor);

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowRadius'), glowRadius);

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowBrightness'), getSliderVal(imgParams.glow.brightness));

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowColorShift'), getSliderVal(imgParams.glow.recolor));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_glowShiftedColor'), hexToRgb(imgParams.glow.to.val));

    gl.uniform1f(gl.getUniformLocation(program, 'u_colorBrightness'), getSliderVal(imgParams.color.brightness));

    gl.uniform1f(gl.getUniformLocation(program, 'u_fade'), getSliderVal(imgParams.fade.fade));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_fadeNearColor'), hexToRgb(imgParams.fade.near.val));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_fadeFarColor'), hexToRgb(imgParams.fade.far.val));

    gl.uniform1f(gl.getUniformLocation(program, 'u_fadeRecolor'), getSliderVal(imgParams.fade.recolor));

    gl.uniform1i(gl.getUniformLocation(program, 'u_mode'), 0);

    const targetTex = createEmptyTexture(0, {w: codeCanvasEl.width, h: codeCanvasEl.height}, gl)
    renderColorToTexture(targetTex, gl);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, gridVertices.length / vertexSize2d);
    await drawTriangles(gridVertices.length / vertexSize2d, gl);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, targetTex);

    gl.uniform1i(gl.getUniformLocation(program, 'u_mode'), 1);

    renderToCanvas(gl);

    await drawTriangles(gridVertices.length / vertexSize2d, gl);
}
