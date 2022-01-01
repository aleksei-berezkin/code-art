import type { CodeSceneDrawn } from './drawCodeScene';
import vertexShaderSource from './shader/effectsVertex.shader';
import fragmentShaderSource from './shader/effectsFragment.shader';
import { createProgram } from './util/createProgram';
import { vertexSize2d} from './util/rect';
import { uploadArrayToAttribute } from './util/uploadArrayToAttribute';
import { uploadTexture } from './util/uploadTexture';

export function drawEffectsScene(canvasEl: HTMLCanvasElement, codeSceneDrawn: CodeSceneDrawn) {
    const gl = canvasEl.getContext('webgl2')!;

    const program = createProgram(vertexShaderSource, fragmentShaderSource, gl);

    // Because w is non-linear of (x, y) we can't draw just one rect of (xMin, yMin)-(xMax, yMax).
    uploadArrayToAttribute('a_position', codeSceneDrawn.verticesArray, vertexSize2d, program, gl);

    uploadTexture(canvasEl, gl.TEXTURE0, gl);

    gl.useProgram(program);

    gl.uniform1i(
        gl.getUniformLocation(program, 'u_image'),
        gl.TEXTURE0,
    );

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'u_tx'),
        false,
        codeSceneDrawn.txMat,
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

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, codeSceneDrawn.verticesArray.length / vertexSize2d);
}
