import type { Size } from './Size';
import { degToRad } from '../util/degToRad';

export type PixelSpace = ReturnType<typeof makePixelSpace>;

const viewAngleV = degToRad(115);
const impliedAspectRatio = 1.9;

/**
 * See figures/01_PixelSpace.png
 *
 * Pixel space (x, y) goes from top-left (-w/2, -h/2) to bottom-right (w/2, h/2).
 * Z goes from -zBase to +large_val*zBase where z=-zBase is a camera position,
 * and z=0 is a distance at which an object with height=h is fully visible.
 *
 * impliedHeight is a height of image with the same width which would
 * perfectly fit impliedAspectRatio.
 * 
 * Vertical view angle is 115 deg (like that of a human eye) so the following
 * equation is valid:
 * 
 * tan(155deg / 2) = (impliedHeight/2) / zBase
 *
 * An object at z=+zBase (2*zBase distance from the camera) is twice smaller than that
 * at z=0, so w = (zBase + z) / zBase = 1 + z / zBase
 */
export function makePixelSpace(size: Size) {
    const {w, h} = size;
    const impliedHeight = Math.max(h, w / impliedAspectRatio);
    const zBase = Math.max(w, impliedHeight) / 2 / Math.tan(viewAngleV / 2);
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
    };
}
