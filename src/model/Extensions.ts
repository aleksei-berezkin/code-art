import type { Mat4 } from '../util/matrices';
import { pluck } from '../util/pluck';
import type { PixelSpace } from './PixelSpace';

export type Extensions = {
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
};

/**
 * Because code plane is rotated, bounds must be extended to fill the whole canvas.
 * Here, "extension" is a multiplier to multiply scene bounds by.
 */
export function calcExtensions(pixelSpace: PixelSpace, xRotAngle: number, yRotAngle: number, zRotAngle: number, txMat: Mat4): Extensions {
    const calculatedExt = calcExtensionsByRotation(pixelSpace, xRotAngle, yRotAngle, zRotAngle);
    return enlargeExtensionsBySimulation(pixelSpace, calculatedExt, txMat);
}

function calcExtensionsByRotation(pixelSpace: PixelSpace, xRotAngle: number, yRotAngle: number, zRotAngle: number) {
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

    return {
        xMin: pluck(0, xMinByY * fudgeByXRot * clipByZRot, 20),
        xMax: pluck(0, xMaxByY * fudgeByXRot * clipByZRot, 20),
        yMin: pluck(0, yMinByX * fudgeByYRot * clipByZRot, 20),
        yMax: pluck(0, yMaxByX * fudgeByYRot * clipByZRot, 20),
    };
}

function enlargeExtensionsBySimulation(pixelSpace: PixelSpace, inputExtensions: Extensions, txMat: Mat4) {
    return  {
        // TODO
        xMin: inputExtensions.xMin,
        xMax: inputExtensions.xMax * 1.5,
        yMin: inputExtensions.yMin,
        yMax: inputExtensions.yMax * 1.5,
    };
}
