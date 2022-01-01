import type { CodeSceneDrawn } from './drawCodeScene';
import { createShader } from './util/createShader';
import vertexShaderSource from './shader/effectsVertex.shader';
import fragmentShaderSource from './shader/effectsFragment.shader';
import { createProgram } from './util/createProgram';
import { vertexSize2d} from "./util/rect";

export function drawEffectsScene(canvasEl: HTMLCanvasElement, codeSceneDrawn: CodeSceneDrawn) {
    const gl = canvasEl.getContext('webgl2')!;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    // Because w is non-linear of (x, y) we can't draw just one rect of (xMin, yMin)-(xMax, yMax).
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, codeSceneDrawn.verticesArray, gl.STATIC_DRAW);
    const positionAttribLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttribLoc);
    gl.vertexAttribPointer(positionAttribLoc, vertexSize2d, gl.FLOAT, false, 0, 0);

    // Upload code scene texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        canvasEl,
    );

    // Using program, setting uniforms
    gl.useProgram(program);

    // Texture (level) uniform
    gl.uniform1i(
        gl.getUniformLocation(program, 'u_image'),
        0,
    );

    // Tx mat
    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'u_tx'),
        false,
        codeSceneDrawn.txMat,
    );

    // Bg
    gl.uniform3fv(
        gl.getUniformLocation(program, 'u_bg'),
        codeSceneDrawn.bgColor,
    );

    // Translate -1...+1 to:
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Go
    gl.drawArrays(gl.TRIANGLES, 0, codeSceneDrawn.verticesArray.length / vertexSize2d);
}
