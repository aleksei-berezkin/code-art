import vertexShaderSource from '../shader/effectsVertex.shader';
import fragmentShaderSource from '../shader/effectsFragment.shader';
import { createProgram } from './createProgram';
import { rect2dVertexSize } from './rect';
import { uploadArrayToAttribute } from './uploadArrayToAttribute';
import { createEmptyTexture } from './uploadTexture';
import { createEffectsGrid } from './createEffectsGrid';
import { hexToRgb, RGB } from '../model/RGB';
import { getSliderVal } from '../model/ImgParams';
import { ceilToOdd } from '../util/ceilToOdd';
import { dpr } from '../util/dpr';
import type { SceneParams } from '../model/generateSceneParams';
import { renderColorToTexture, renderToCanvas } from './renderColorToTexture';
import { getOptics } from '../model/Optics';
import { drawTriangles } from './drawTriangles';
import type { WorkLimiter } from '../util/workLimiter';

const maxKernel = 25;

export async function drawEffectsScene(
    sceneParams: SceneParams,
    bgColor: RGB,
    inputTexture: WebGLTexture,
    codeCanvasEl: HTMLCanvasElement,
    workLimiter: WorkLimiter,
) {
    const gl = codeCanvasEl.getContext('webgl2')!;

    const { imgParams } = sceneParams;
    const glowRadius = getSliderVal(imgParams.font.size) * getSliderVal(imgParams.glow.radius) / 2;
    const glowKSize = ceilToOdd(glowRadius * .65 * dpr, maxKernel);
    const blurKSize = ceilToOdd(2.65 * imgParams.fade.blur.val * dpr, maxKernel);
    const loopSize = Math.max(glowKSize, blurKSize);

    const fragmentShaderSourceProcessed = fragmentShaderSource
        .replaceAll('_LOOP_SZ_', String(loopSize))

    const program = await createProgram(vertexShaderSource, fragmentShaderSourceProcessed, gl);

    const gridVertices = await createEffectsGrid(sceneParams.pixelSpace, sceneParams.extensions, imgParams.font.size.val, workLimiter);
    uploadArrayToAttribute('a_position', gridVertices, rect2dVertexSize, program, gl);

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

    const optics = getOptics(sceneParams.pixelSpace, getSliderVal(sceneParams.imgParams.fade.blur));

    gl.uniform1f(gl.getUniformLocation(program, 'u_focalLength'), optics.focalLength);

    gl.uniform1f(
        gl.getUniformLocation(program, 'u_distanceToSensor'),
        1 / (1 / optics.focalLength - 1 / sceneParams.pixelSpace.zBase),
    );

    gl.uniform1f(gl.getUniformLocation(program, 'u_lensDiameter'), optics.lensDiameter);

    gl.uniform3fv(gl.getUniformLocation(program, 'u_bg'), bgColor);

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowRadius'), glowRadius);

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowBrightness'), getSliderVal(imgParams.glow.brightness));

    gl.uniform1f(gl.getUniformLocation(program, 'u_glowColorShift'), getSliderVal(imgParams.glow.recolor));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_glowShiftedColor'), hexToRgb(imgParams.glow.to.val));

    gl.uniform1f(gl.getUniformLocation(program, 'u_colorBrightness'), getSliderVal(imgParams['main color'].brightness));

    gl.uniform1f(gl.getUniformLocation(program, 'u_fade'), getSliderVal(imgParams.fade.fade));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_fadeNearColor'), hexToRgb(imgParams.fade.near.val));

    gl.uniform3fv(gl.getUniformLocation(program, 'u_fadeFarColor'), hexToRgb(imgParams.fade.far.val));

    gl.uniform1f(gl.getUniformLocation(program, 'u_fadeRecolor'), getSliderVal(imgParams.fade.recolor));

    gl.uniform1i(gl.getUniformLocation(program, 'u_mode'), 0);

    const glowTex = createEmptyTexture(0, {w: codeCanvasEl.width, h: codeCanvasEl.height}, gl)
    renderColorToTexture(glowTex, gl);

    await workLimiter.next();

    await drawTriangles(gridVertices.length / rect2dVertexSize, gl);

    // Blur mode

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, glowTex);

    const targetTex = createEmptyTexture(0, {w: codeCanvasEl.width, h: codeCanvasEl.height}, gl)
    renderColorToTexture(targetTex, gl);

    gl.uniform1i(gl.getUniformLocation(program, 'u_mode'), 1);

    await workLimiter.next();

    await drawTriangles(gridVertices.length / rect2dVertexSize, gl);

    return targetTex;
}
