import { asMat4, getRotateXMat, getRotateYMat, getRotateZMat, getTranslateMat, mul } from '../util/matrices';
import type { PixelSpace } from './PixelSpace';

export function getTxMax(pixelSpace: PixelSpace, xAngle: number, yAngle: number, zAngle: number, xTransPercent: number, yTransPercent: number, zTransPercent: number) {
    // Transform in pixel space
    const txMatPixels =
        mul(
            getTranslateMat(
                xTransPercent / 100 * pixelSpace.w,
                yTransPercent / 100 * pixelSpace.h,
                zTransPercent / 100 * pixelSpace.zBase,
            ),
            getRotateXMat(xAngle),
            getRotateYMat(yAngle),
            getRotateZMat(zAngle),
        );

    // Pixel space to clip space
    const toClipSpaceMat = asMat4([
        // xMin(==-xMax) ... xMax -> -1 ... +1
        1 / pixelSpace.xMax, 0, 0, 0,
        // yMin(==-yMax) ... yMax -> +1 ... -1
        0, -1 / pixelSpace.yMax, 0, 0,
        // zMin ... zMax -> -1 ... +1 (won't be divided by w)
        0, 0, 2 / pixelSpace.zSpan, -1 - 2 * pixelSpace.zMin / pixelSpace.zSpan,
        // zMin(==-zBase)...0...zBase...zMax -> 0...+1...+2...(zSpan/zBase)
        0, 0, 1 / pixelSpace.zBase, 1,
    ]);

    return mul(toClipSpaceMat, txMatPixels);
}
