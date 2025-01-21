// See figures/04_Optics.png
import type { PixelSpace } from './PixelSpace';

export function getOptics(pixelSpace: PixelSpace, blurFactor: number) {
    return{
        lensDiameter: .08 * pixelSpace.w * blurFactor,
        focalLength: .04 * pixelSpace.w,
    };
}
