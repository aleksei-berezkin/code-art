import { createShader } from './createShader';
import { createProgram } from './createProgram';
import vertexShaderSource from './shader/twoDVertex.shader';
import fragmentShaderSource from './shader/twoDFragment.shader';
import type { Transformations } from './txType';

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
    const scaleUniformLocation = gl.getUniformLocation(program, 'u_scale');
    gl.uniform2f(scaleUniformLocation, 1 + tfs['scale x'] * 2, 1 + tfs['scale y'] * 2);

    const angleUniformLocation = gl.getUniformLocation(program, 'u_angle');
    gl.uniform1f(angleUniformLocation, tfs['angle'] * Math.PI);

    const translateUniformLocation = gl.getUniformLocation(program, 'u_translate');
    gl.uniform2f(translateUniformLocation, tfs['translate x'], tfs['translate y']);
    // ---- / -----

    // Translate -1...+1 to:
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0.08);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Go
    gl.drawArrays(gl.TRIANGLES, 0, fTriangles.length / 2);
}

function rect(x1: number, y1: number, x2: number, y2: number) {
    return [x1, y1,   x2, y1,   x2, y2,   x1, y1,   x1, y2,   x2, y2];
}
