import {createShader} from './createShader';
import {createProgram} from './createProgram';
import vertexShaderSource from './shader/gridVertex.shader';
import fragmentShaderSource from './shader/gridFragment.shader';
import type {Transformations} from './txType';
import {asMat4, getRotateXMat, getRotateYMat, getRotateZMat, getScaleMat, getTranslateMat, mul} from './matrices';
import {createGrid} from './createGrid';
import {vertexSize3d} from './rect';

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

    const xRotAngle = -tfs['angle x'] * Math.PI / 4;
    const yRotAngle = -tfs['angle y'] * Math.PI / 2;
    const zRotAngle = tfs['angle z'] * Math.PI;

    const ext = calcExtensions(pixelSpace, xRotAngle, yRotAngle, zRotAngle);

    const grid = createGrid(
        pixelSpace.xMin * ext.xMin, pixelSpace.yMin * ext.yMin,
        pixelSpace.xMax * ext.xMax, pixelSpace.yMax * ext.yMax,
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
            getRotateXMat(xRotAngle),
            getRotateYMat(yRotAngle),
            getRotateZMat(zRotAngle),
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
    const viewAngleV = degToRag(115);
    const zBase = h / 2 / Math.tan(viewAngleV / 2);
    const viewAngleH = Math.atan(w / 2 / zBase) * 2;
    const zMin = -zBase;
    const zMax = zBase * 1000;
    return {
        viewAngleH,
        viewAngleV,
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

function radToDeg(deg: number) {
    return deg / 2 / Math.PI * 360;
}

type PixelSpace = ReturnType<typeof makePixelSpace>;

function calcExtensions(pixelSpace: PixelSpace, xRotAngle: number, yRotAngle: number, zRotAngle: number) {
    const {viewAngleH, viewAngleV} = pixelSpace;

    const maxYRot = Math.PI / 2 - viewAngleH / 2 - .01;
    const maxXRot = Math.PI / 2 - viewAngleV / 2 - .01;
    const _yRotAngle = pluck(-maxYRot, yRotAngle, maxYRot);
    const _xRotAngle = pluck(-maxXRot, xRotAngle, maxXRot);

    // Sine theorem
    const xMinByY = pluck(0, Math.sin(Math.PI / 2 + viewAngleH / 2) / Math.sin(Math.PI / 2 - _yRotAngle - viewAngleH / 2), 32.0);
    const xMaxByY = pluck(0, Math.sin(Math.PI / 2 + viewAngleH / 2) / Math.sin(Math.PI / 2 + _yRotAngle - viewAngleH / 2), 32.0);

    const yMinByX = pluck(0, Math.sin(Math.PI / 2 + viewAngleV / 2) / Math.sin(Math.PI / 2 - _xRotAngle - viewAngleV / 2), 12.0);
    const yMaxByX = pluck(0, Math.sin(Math.PI / 2 + viewAngleV / 2) / Math.sin(Math.PI / 2 + _xRotAngle - viewAngleV / 2), 12.0);

    // Z distance from farthest point
    const fudgeByYRot = pixelSpace.xMax * Math.max(xMinByY, xMaxByY) * Math.sin(Math.abs(_yRotAngle)) / pixelSpace.zBase + 1;
    const fudgeByXRot = pixelSpace.yMax * Math.max(yMinByX, yMaxByX) * Math.sin(Math.abs(_xRotAngle)) / pixelSpace.zBase + 1;

    const clipByZRot = pixelSpace.xMax / pixelSpace.yMax * Math.abs(zRotAngle) / Math.PI * 2 + 1; 
    /*
     * Just multiplying fudges in 3d space is incorrect: when both angles are nonzero result fudge is larger.
     * The following is empirically picked factor working for moderate angles..
     */
    const extraFudge = 1 + (40 * Math.abs(xRotAngle) * Math.abs(yRotAngle)) ** 1.8;

    const extraFudges = {
        xMin: yRotAngle > 0 ? extraFudge : 1,
        xMax: yRotAngle < 0 ? extraFudge : 1,
        yMin: xRotAngle > 0 ? extraFudge : 1,
        yMax: xRotAngle < 0 ? extraFudge : 1,
    };

    return {
        xMin: pluck(0, xMinByY * fudgeByXRot * extraFudges.xMin * clipByZRot, 20),
        xMax: pluck(0, xMaxByY * fudgeByXRot * extraFudges.xMax * clipByZRot, 20),
        yMin: pluck(0, yMinByX * fudgeByYRot * extraFudges.yMin * clipByZRot, 20),
        yMax: pluck(0, yMaxByX * fudgeByYRot * extraFudges.yMax * clipByZRot, 20),
    };
}

function pluck(min: number, a: number, max: number) {
    return Math.max(min, Math.min(a, max));
}
