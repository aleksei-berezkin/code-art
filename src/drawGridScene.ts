import { createShader } from './createShader';
import { createProgram } from './createProgram';
import vertexShaderSource from './shader/gridVertex.shader';
import fragmentShaderSource from './shader/gridFragment.shader';
import type { Transformations } from './txType';
import { asMat4, getRotateXMat, getRotateYMat, getRotateZMat, getScaleMat, getTranslateMat, mul } from './matrices';
import { createGrid } from './createGrid';
import { vertexSize3d } from './rect';

const bgColor = [.2, .2, .3, 1] as const;
export function drawGridScene(canvasEl: HTMLCanvasElement, tfs: Transformations) {
    const gl = canvasEl.getContext('webgl2');
    if (!gl) {
        throw new Error('webgl2 not supported');
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const pixelSpace = makePixelSpace(canvasEl.width, canvasEl.height);
    const xExtension = 4.5;
    const yExtension = 3.5
    const grid = createGrid(
        pixelSpace.xMin * xExtension, pixelSpace.yMin * yExtension,
        pixelSpace.xMax * xExtension, pixelSpace.yMax * yExtension,
        0,
        48, 72,
    );

    // ---- Push vertices to buffer ----
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grid.vertices), gl.STATIC_DRAW);
    // ---- / ----

    // ---- Pull vertices from buffer to attribute ----
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, vertexSize3d, gl.FLOAT, false, 0, 0);
    // ---- / ----

    // ---- Push colors to buffer ----
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grid.colors), gl.STATIC_DRAW);
    // ---- / ----

    // ---- Pull colors from buffer to attribute ----
    const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
    // ---- / ----

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // ---- Create and bind transformations uniform ----
    const txMatPixels =
        mul(
            getTranslateMat(
                tfs['translate x'] * pixelSpace.xMin,
                tfs['translate y'] * pixelSpace.yMin,
                tfs['translate z'] * pixelSpace.zBase * 8,
            ),
            getRotateXMat(-tfs['angle x'] * Math.PI / 4),
            getRotateYMat(-tfs['angle y'] * Math.PI / 2),
            getRotateZMat(-tfs['angle z'] * Math.PI),
            getScaleMat(1 + tfs['scale x'], 1 + tfs['scale y'], 1),
        );

    const toClipSpaceMat = asMat4([
        // -toX ... +toX -> -1 ... +1
        1 / pixelSpace.xMax, 0, 0, 0,
        // -toY ... +toY -> -1 ... +1
        0, 1 / pixelSpace.yMax, 0, 0,
        // fromZ ... toZ -> -1 ... +1 (won't be divided by w)
        0, 0, 2 / pixelSpace.zSpan, -1 - 2 * pixelSpace.zMin / pixelSpace.zSpan,
        // -baseDepth ... baseDepth -> 0 ... +2
        0, 0, 1 / pixelSpace.zBase, 1,
    ]);

    const txMat = mul(toClipSpaceMat, txMatPixels);

    const txLocation = gl.getUniformLocation(program, 'u_tx');
    gl.uniformMatrix4fv(txLocation, false, txMat);
    // ---- / -----

    // ---- Bg uniform
    const bgLocation = gl.getUniformLocation(program, 'u_bg');
    gl.uniform4fv(bgLocation, bgColor);
    // ---- / ----

    // Translate -1...+1 to:
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(...bgColor);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Go
    gl.drawArrays(gl.TRIANGLES, 0, grid.vertices.length / vertexSize3d);
}

/**
 * Pixel space (x, y) goes from top-left (-w/2, -h/2) to bottom-right (w/2, h/2).
 * Z goes from -zBase to +large_val*zBase where z=-zBase is an eye position,
 * and z=0 is a depth at which an object with height=h is fully visible.
 * 
 * Vertical view angle is 115 deg (like that of human) so the following equation is valid:
 * tan(155deg / 2) = (h/2) / zBase
 * 
 * An object at z=+zBase (2*zBase distance from an eye) is twice smaller than that
 * at z=0, so w = (zBase + z) / zBase = 1 + z / zBase
 */
function makePixelSpace(w: number, h: number) {
    const zBase = h / 2 / Math.tan(degToRag(115) / 2);
    const zMin = -zBase;
    const zMax = zBase * 1000;
    return {
        xMin: -w/2,
        yMin: -h/2,
        xMax: w/2,
        yMax: h/2,
        zMin,
        zBase,
        zMax,
        zSpan: zMax - zMin,
    };
}

function degToRag(deg: number) {
    return deg / 360 * 2 * Math.PI;
}
