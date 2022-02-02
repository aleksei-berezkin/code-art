import type { Mat4 } from '../util/matrices';
import { pluck } from '../util/pluck';
import type { PixelSpace } from './PixelSpace';

export type Extensions = ReturnType<typeof calcExtensions>;

/**
 * Because code plane is rotated, bounds must be extended to fill the whole canvas.
 * Here, "extension" is a multiplier to multiply scene bounds by.
 */
export function calcExtensions(pixelSpace: PixelSpace, xRotAngle: number, yRotAngle: number, zRotAngle: number, txMat: Mat4) {
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
