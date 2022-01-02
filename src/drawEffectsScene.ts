import type { CodeSceneDrawn } from './drawCodeScene';
import vertexShaderSource from './shader/effectsVertex.shader';
import fragmentShaderSourceWithMacro from './shader/effectsFragment.shader';
import { createProgram } from './util/createProgram';
import { vertexSize2d } from './util/rect';
import { uploadArrayToAttribute } from './util/uploadArrayToAttribute';
import { uploadTexture } from './util/uploadTexture';
import { blurKernel, blurKernelSize, blurKernelWeight } from './blurKernel';
import { createEffectsGrid } from './createEffectsGrid';

const fragmentShaderSource = fragmentShaderSourceWithMacro
    .replaceAll('_BLUR_K_SZ_', String(blurKernelSize));

export function drawEffectsScene(canvasEl: HTMLCanvasElement, codeSceneDrawn: CodeSceneDrawn, fontSize: number) {
    const gl = canvasEl.getContext('webgl2')!;

    const program = createProgram(vertexShaderSource, fragmentShaderSource, gl);

    const gridVertices = createEffectsGrid(codeSceneDrawn.pixelSpace, codeSceneDrawn.extensions, fontSize);
    uploadArrayToAttribute('a_position', new Float32Array(gridVertices), vertexSize2d, program, gl);

    uploadTexture(canvasEl, gl.TEXTURE0, gl);

    gl.useProgram(program);

    gl.uniform1i(
        gl.getUniformLocation(program, 'u_image'),
        0,
    );

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'u_tx'),
        false,
        codeSceneDrawn.txMat,
    );

    gl.uniform1f(
        gl.getUniformLocation(program, 'u_xMax'),
        codeSceneDrawn.pixelSpace.xMax,
    );

    // noinspection JSSuspiciousNameCombination
    gl.uniform1f(
        gl.getUniformLocation(program, 'u_yMax'),
        codeSceneDrawn.pixelSpace.yMax,
    );

    gl.uniform1f(
        gl.getUniformLocation(program, 'u_zBase'),
        codeSceneDrawn.pixelSpace.zBase,
    );

    gl.uniform1f(
        gl.getUniformLocation(program, 'u_focalLength'),
        codeSceneDrawn.pixelSpace.optics.focalLength,
    );

    gl.uniform1f(
        gl.getUniformLocation(program, 'u_distanceToSensor'),
        1 / (1 / codeSceneDrawn.pixelSpace.optics.focalLength - 1 / codeSceneDrawn.pixelSpace.zBase),
    );

    gl.uniform1f(
        gl.getUniformLocation(program, 'u_lensDiameter'),
        codeSceneDrawn.pixelSpace.optics.lensDiameter,
    );

    gl.uniform3fv(
        gl.getUniformLocation(program, 'u_bg'),
        codeSceneDrawn.bgColor,
    );

    gl.uniform1fv(
        gl.getUniformLocation(program, 'u_blurKernel'),
        blurKernel,
    );

    gl.uniform1f(
        gl.getUniformLocation(program, 'u_blurKernelWeight'),
        blurKernelWeight,
    );

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, gridVertices.length / vertexSize2d);
}
