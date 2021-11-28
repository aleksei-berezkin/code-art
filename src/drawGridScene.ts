import { createShader } from './createShader';
import { createProgram } from './createProgram';
import vertexShaderSource from './shader/gridVertex.shader';
import fragmentShaderSource from './shader/gridFragment.shader';
import type { Transformations } from './txType';
import {getRotateZMat, getScaleMat, getTranslateMat, mul } from './matrices';
import { createGrid } from './createGrid';
import { vertexSize3d } from './rect';

export function drawGridScene(canvasEl: HTMLCanvasElement, tfs: Transformations) {
    const gl = canvasEl.getContext('webgl2');
    if (!gl) {
        throw new Error('webgl2 not supported');
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const depth = canvasEl.width;
    const grid = createGrid(canvasEl.width, canvasEl.height, depth, 100, 160);

    // ---- Push vertices to buffer ----
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grid.vertices), gl.STATIC_DRAW);
    // ---- / ----

    // ---- Pull vertices from buffer to attribute ----
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, vertexSize3d, gl.FLOAT, false, 0, 0);
    // ---- / ----

    // ---- Push vertices to buffer ----
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grid.colors), gl.STATIC_DRAW);
    // ---- / ----

    // ---- Pull vertices from buffer to attribute ----
    const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
    // ---- / ----

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // ---- Create and bind transformations uniform ----
    const translateToCenter = getTranslateMat(-canvasEl.width / 2, -canvasEl.height / 2, 0);
    const translateBack = getTranslateMat(canvasEl.width / 2, canvasEl.height / 2, 0);
    const txMatPixels =
        mul(
            translateBack,
            mul(
                getTranslateMat(tfs['translate x'] * canvasEl.width, tfs['translate y'] * canvasEl.height, 0),
                mul(
                    getRotateZMat(-tfs['angle'] * Math.PI),
                    mul(
                        getScaleMat(1 + tfs['scale x'], 1 + tfs['scale y'], 1),
                        translateToCenter,
                    )
                ),
            ),
        )

    const toClipSpaceMat = mul(
        getTranslateMat(-1, 1, -1),
        getScaleMat(2 / canvasEl.width, -2 / canvasEl.height, 2 / depth),
    );

    const txMat = mul(toClipSpaceMat, txMatPixels);
    const txLocation = gl.getUniformLocation(program, 'u_tx');
    gl.uniformMatrix4fv(txLocation, false, txMat);
    // ---- / -----

    // Translate -1...+1 to:
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0.08);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Go
    gl.drawArrays(gl.TRIANGLES, 0, grid.vertices.length / vertexSize3d);
}
