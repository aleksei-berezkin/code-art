import { degToRag } from './util/degToRad';
import { pluck } from './util/pluck';

export type PixelSpace = ReturnType<typeof makePixelSpace>;

/**
 * See figures/01_PixelSpace.png
 *
 * Pixel space (x, y) goes from top-left (-w/2, -h/2) to bottom-right (w/2, h/2).
 * Z goes from -zBase to +large_val*zBase where z=-zBase is a camera position,
 * and z=0 is a distance at which an object with height=h is fully visible.
 *
 * Vertical view angle is 115 deg (like that of a human eye) so the following
 * equation is valid:
 * 
 * tan(155deg / 2) = (h/2) / zBase
 *
 * An object at z=+zBase (2*zBase distance from the camera) is twice smaller than that
 * at z=0, so w = (zBase + z) / zBase = 1 + z / zBase
 */
export function makePixelSpace(w: number, h: number, blurFactor: number) {
    const viewAngleV = degToRag(115);
    const zBase = h / 2 / Math.tan(viewAngleV / 2);
    const viewAngleH = Math.atan(w / 2 / zBase) * 2;
    const zMin = -zBase;
    const zMax = 1000 * zBase;
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
        // See figures/04_Optics.png
        optics: {
            lensDiameter: .08 * w * blurFactor,
            focalLength: .04 * w,
        },
    };
}

export type Extensions = ReturnType<typeof calcExtensions>;

/**
 * Because code plane is rotated, bounds must be extended to fill the whole canvas.
 * Here, "extension" is a multiplier to multiply scene bounds by.
 */
export function calcExtensions(pixelSpace: PixelSpace, xRotAngle: number, yRotAngle: number, zRotAngle: number) {
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

export type SceneBounds = ReturnType<typeof getSceneBounds>;

export function getSceneBounds(pSp: PixelSpace, ext: Extensions) {
    return {
        xMin: pSp.xMin * ext.xMin,
        yMin: pSp.yMin * ext.yMin,
        xMax: pSp.xMax * ext.xMax,
        yMax: pSp.yMax * ext.yMax,
    };
}
