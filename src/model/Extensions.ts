import type { Mat4 } from '../util/matrices';
import { pluck } from '../util/pluck';
import type { PixelSpace } from './PixelSpace';
import { getSceneBounds } from './SceneBounds';
import { applyTx } from '../util/applyTx';
import { isVisibleInClipSpace } from '../util/isVisibleInClipSpace';
import type { WorkLimiter } from '../util/workLimiter';

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
export async function calcExtensions(pixelSpace: PixelSpace, xRotAngle: number, yRotAngle: number, zRotAngle: number, txMat: Mat4, workLimiter: WorkLimiter): Promise<Extensions> {
    const ext = calcExtensionsByRotation(pixelSpace, xRotAngle, yRotAngle, zRotAngle);
    await enlargeExtensionsBySimulation(pixelSpace, ext, txMat, workLimiter);
    return ext;
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

type Side = 'top' | 'right' | 'bottom' | 'left';
const allSides: Side[] = ['top', 'right', 'bottom', 'left'];

const maxIterations = 800;
const maxExtension = 1000;
const samplesNum = 150;
const enlargeFactor = .05;

async function enlargeExtensionsBySimulation(pixelSpace: PixelSpace, extensionsWritable: Extensions, txMat: Mat4, workLimiter: WorkLimiter) {
    let sides: Set<Side> = new Set(allSides);
    for (let i = 0; i < maxIterations; i++) {
        await workLimiter.next();
        const modifiedSides: Set<Side> = new Set();
        for (const side of sides) {
            if (runEdge(side, pixelSpace, extensionsWritable, txMat)) {
                modifiedSides.add(side);
            }
        }
        if (!modifiedSides.size) {
            break;
        }
        sides = modifiedSides;
    }
}

function runEdge(side: Side, pixelSpace: PixelSpace, currentExtensionsWritable: Extensions, txMat: Mat4) {
    const component = side === 'top' ? 'yMin'
        : side === 'right' ? 'xMax'
        : side === 'bottom' ? 'yMax'
        : side === 'left' ? 'xMin'
        : undefined as never

    if (currentExtensionsWritable[component] >= maxExtension) {
        return false;
    }

    const b = getSceneBounds(pixelSpace, currentExtensionsWritable);
    const [[x1, y1], [x2, y2]] = side === 'top' ? [[b.xMin, b.yMin], [b.xMax, b.yMin]]
        : side === 'right' ? [[b.xMax, b.yMin], [b.xMax, b.yMax]]
        : side === 'bottom' ? [[b.xMax, b.yMax], [b.xMin, b.yMax]]
        : side === 'left' ? [[b.xMin, b.yMax], [b.xMin, b.yMin]]
        : undefined as never;

    let visibleCount = 0;
    for (let i = 0; i < samplesNum; i++) {
        const x = x1 + i / (samplesNum - 1) * (x2 - x1);
        const y = y1 + i / (samplesNum - 1) * (y2 - y1);
        const [_x, _y] = applyTx(txMat, x, y);
        if (isVisibleInClipSpace(_x, _y)) {
            visibleCount++;
        }
    }

    if (!visibleCount) {
        return false;
    }

    const visibleFraction = visibleCount / samplesNum;

    currentExtensionsWritable[component] *= 1 + enlargeFactor * visibleFraction;
    return true;
}
