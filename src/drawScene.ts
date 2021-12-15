import {createShader} from './createShader';
import {createProgram} from './createProgram';
import vertexShaderSource from './shader/twoDVertex.shader';
import fragmentShaderSource from './shader/twoDFragment.shader';
import type {Transformations} from './txType';
import {getRotateZMat, getScaleMat, getTranslateMat, mul, transpose} from "./matrices";
import {rect} from "./rect";

// F
const xThickness = .06;
const yThickness = xThickness * 3 / 2;

const height = .5;
const upperLen = .14;

const midY = .21;
const midLen = .08;

const fTriangles = [
    // Vertical
    ...rect(0, 0, xThickness, height),
    // Upper
    ...rect(xThickness, height, xThickness + upperLen, height - yThickness),
    // Mid
    ...rect(xThickness, midY, xThickness + midLen, midY + yThickness),
];

export function drawScene(canvasEl: HTMLCanvasElement, rgb: [number, number, number], tfs: Transformations) {
    const gl = canvasEl.getContext('webgl2');
    if (!gl) {
        throw new Error('webgl2 not supported');
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    // ---- Push vertices to buffer ----
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fTriangles), gl.STATIC_DRAW);
    // ---- / ----

    // ---- Pull vertices from buffer to attribute ----
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    // ---- / ----

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // ---- Create and bind color uniform ----
    const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    gl.uniform4f(colorUniformLocation, ...rgb, 1);
    // ---- / ----

    // ---- Create and bind transformations uniform ----
    const txMat =
        mul(
            getTranslateMat(tfs['translate x'], tfs['translate y'], 0),
            mul(
                getRotateZMat(tfs['angle z'] * Math.PI),
                getScaleMat(1 + tfs['scale x'] * 2, 1 + tfs['scale y'] * 2, 1),
            ),
        );

    const txLocation = gl.getUniformLocation(program, 'u_tx');
    gl.uniformMatrix4fv(txLocation, false, txMat);
    // ---- / -----

    // Translate -1...+1 to:
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0.08);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Go
    gl.drawArrays(gl.TRIANGLES, 0, fTriangles.length / 2);
}

