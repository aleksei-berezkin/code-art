import { rect2d } from './rect';
import type {Extensions, PixelSpace, SceneBounds} from "../model/PixelSpace";
import {getSceneBounds} from "../model/PixelSpace";

const cellSizeMultiplier = 4;

// Because w is non-linear of (x, y) we can't draw just one rect of (xMin, yMin)-(xMax, yMax).
export function createEffectsGrid(pSp: PixelSpace,
                                  extensions: Extensions,
                                  fontSize: number) {
    const bounds = getSceneBounds(pSp, extendExtensions(extensions));
    const vertices: number[] = [];
    const step = fontSize * cellSizeMultiplier;
    for (let x = bounds.xMin; x <= bounds.xMax + step; x += step) {
        for (let y = bounds.yMin; y <= bounds.yMax + step; y += step) {
            vertices.push(...rect2d(x, y, x + step, y + step));
        }
    }
    return vertices;
}

/**
 * To have blur near edges
 */
function extendExtensions(ext: Extensions): Extensions {
    return {
        xMin: extend(ext.xMin),
        yMin: extend(ext.yMin),
        xMax: extend(ext.xMax),
        yMax: extend(ext.yMax),
    };
}

const extPow = 1.2;
function extend(ext: number) {
    if (ext < 2) {
        return ext * 2;
    }
    return ext ** extPow;
}
