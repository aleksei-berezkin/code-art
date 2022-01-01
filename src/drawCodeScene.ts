import { createShader } from './util/createShader';
import { createProgram } from './util/createProgram';
import vertexShaderSource from './shader/codeVertex.shader';
import fragmentShaderSource from './shader/codeFragment.shader';
import type { Transformations } from './Transformations';
import {
    asMat4,
    getRotateXMat,
    getRotateYMat,
    getRotateZMat,
    getTranslateMat,
    Mat4,
    mul,
} from './util/matrices';
import { createCodeSceneData } from './createCodeSceneData';
import { vertexSize2d } from './util/rect';
import type { GlyphRaster } from './rasterizeFont';
import type { Source } from './getSource';
import { pluck } from './util/pluck';
import { degToRag } from './util/degToRad';
import { RGB, rgbSize } from './ColorScheme';
import type { CodeColorization } from './colorizeCode';
import { uploadArrayToAttribute } from './util/uploadArrayToAttribute';
import { uploadTexture } from './util/uploadTexture';

export type CodeSceneDrawn = {
    verticesArray: Float32Array,
    txMat: Mat4,
    bgColor: RGB,
}

// TODO render to texture
export function drawCodeScene(canvasEl: HTMLCanvasElement,
                              rasterCanvasEl: HTMLCanvasElement,
                              tfs: Transformations,
                              source: Source,
                              codeColorization: CodeColorization,
                              glyphRaster: GlyphRaster,
): CodeSceneDrawn {
    const gl = canvasEl.getContext('webgl2');
    if (!gl) {
        throw new Error('webgl2 not supported');
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const pSp = makePixelSpace(canvasEl.width, canvasEl.height);

    const xRotAngle = -tfs['angle x'].val;
    const yRotAngle = -tfs['angle y'].val;
    const zRotAngle = tfs['angle z'].val;

    const ext = calcExtensions(pSp, xRotAngle, yRotAngle, zRotAngle);

    const sceneBounds = {
        xMin: pSp.xMin * ext.xMin,
        yMin: pSp.yMin * ext.yMin,
        xMax: pSp.xMax * ext.xMax,
        yMax: pSp.yMax * ext.yMax,
    };

    const sceneData = createCodeSceneData(
        sceneBounds,
        tfs.scroll.val / 100,
        tfs['font size'].val,
        source,
        codeColorization,
        glyphRaster,
    );

    const verticesArray = new Float32Array(sceneData.vertices);
    uploadArrayToAttribute('a_position', verticesArray, vertexSize2d, program, gl);

    uploadArrayToAttribute('a_texPosition', new Float32Array(sceneData.texPosition), vertexSize2d, program, gl);

    uploadArrayToAttribute('a_color', new Float32Array(sceneData.colors), rgbSize, program, gl);

    uploadTexture(rasterCanvasEl, gl.TEXTURE0, gl);

    gl.useProgram(program);

    gl.uniform1i(
        gl.getUniformLocation(program, 'u_letters'),
        gl.TEXTURE0,
    );

    // Transform scene then transform to clip space
    const txMatPixels =
        mul(
            getTranslateMat(
                tfs['translate x'].val / 100 * pSp.w,
                tfs['translate y'].val / 100 * pSp.h,
                tfs['translate z'].val / 100 * pSp.zBase,
            ),
            getRotateXMat(xRotAngle),
            getRotateYMat(yRotAngle),
            getRotateZMat(zRotAngle),
        );

    const toClipSpaceMat = asMat4([
        // xMin(==-xMax) ... xMax -> -1 ... +1
        1 / pSp.xMax, 0, 0, 0,
        // yMin(==-yMax) ... yMax -> +1 ... -1
        0, -1 / pSp.yMax, 0, 0,
        // zMin ... zMax -> -1 ... +1 (won't be divided by w)
        0, 0, 2 / pSp.zSpan, -1 - 2 * pSp.zMin / pSp.zSpan,
        // zMin(==-zBase)...zBase...zMax -> 0...+2...(zSpan/zBase)
        0, 0, 1 / pSp.zBase, 1,
    ]);

    const txMat = mul(toClipSpaceMat, txMatPixels);

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'u_tx'),
        false,
        txMat,
    );

    gl.uniform3fv(
        gl.getUniformLocation(program, 'u_bg'),
        codeColorization.bgColor,
    );

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(...codeColorization.bgColor, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, sceneData.vertices.length / vertexSize2d);

    return {verticesArray, txMat, bgColor: codeColorization.bgColor};
}

/**
 * See figures/01_PixelSpace.png
 * 
 * Pixel space (x, y) goes from top-left (-w/2, -h/2) to bottom-right (w/2, h/2).
 * Z goes from -zBase to +large_val*zBase where z=-zBase is a camera position,
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
        w,
        h,
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

type PixelSpace = ReturnType<typeof makePixelSpace>;

function calcExtensions(pixelSpace: PixelSpace, xRotAngle: number, yRotAngle: number, zRotAngle: number) {
    const {viewAngleH, viewAngleV} = pixelSpace;

    const maxYRot = Math.PI / 2 - viewAngleH / 2 - .01;
    const maxXRot = Math.PI / 2 - viewAngleV / 2 - .01;
    const _yRotAngle = pluck(-maxYRot, yRotAngle, maxYRot);
    const _xRotAngle = pluck(-maxXRot, xRotAngle, maxXRot);

    // See figures/02_ExtensionByRotation.png
    const xMinByY = Math.sin(Math.PI / 2 + viewAngleH / 2) / Math.sin(Math.PI / 2 - _yRotAngle - viewAngleH / 2);
    const xMaxByY = Math.sin(Math.PI / 2 + viewAngleH / 2) / Math.sin(Math.PI / 2 + _yRotAngle - viewAngleH / 2);

    const yMinByX = Math.sin(Math.PI / 2 + viewAngleV / 2) / Math.sin(Math.PI / 2 - _xRotAngle - viewAngleV / 2);
    const yMaxByX = Math.sin(Math.PI / 2 + viewAngleV / 2) / Math.sin(Math.PI / 2 + _xRotAngle - viewAngleV / 2);

    // See figures/03_FudgeByRotation.png
    const fudgeByYRot = pixelSpace.xMax * Math.max(xMinByY, xMaxByY) * Math.sin(Math.abs(_yRotAngle)) / pixelSpace.zBase + 1;
    const fudgeByXRot = pixelSpace.yMax * Math.max(yMinByX, yMaxByX) * Math.sin(Math.abs(_xRotAngle)) / pixelSpace.zBase + 1;

    const ratio = pixelSpace.xMax / pixelSpace.yMax;
    const clipByZRot = ratio * Math.abs(zRotAngle) / Math.PI * 2 + 1; 
    /*
     * Just multiplying independently calculated fudges in 3d space is incorrect,
     * but I can't imagine correct 3d geometry. The following is empiric formula
     * works for moderate angles.
     */
    const extraFudge = 1 + (20 * Math.abs(xRotAngle) * Math.abs(yRotAngle)) ** 1.9;

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
