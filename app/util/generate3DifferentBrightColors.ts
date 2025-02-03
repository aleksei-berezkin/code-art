import type { RGB } from '../model/RGB'
import { hslToRgb } from './hslToRgb'

export function generate3DifferentBrightColors(): RGB[] {
    return generate3DifferentHues()
        .map(h => hslToRgb(
            h,
            .6 + Math.random() * .4,
            .5 + Math.random() * .25,
        ))
}

function generate3DifferentHues(): number[] {
    const [h1, h2, h3] = Array.from({length: 3})
        .map(() => Math.random() * 360)
    if (isFarEnough(h1, h2) && isFarEnough(h2, h3) && isFarEnough(h1, h3)) {
        return [h1, h2, h3]
    }
    return generate3DifferentHues()
}

const d = 60
function isFarEnough(x: number, y: number) {
    return Math.abs(x - y) > d && Math.abs(x - y) < 360 - d
}
