import type { ImgParams } from './ImgParams'
import { getSliderVal } from './ImgParams'

export type ScrollFraction = {
    v: number,
    h: number,
}

export function getScrollFraction(imgParams: ImgParams): ScrollFraction {
    return {
        v: getSliderVal(imgParams.scroll.v),
        h: getSliderVal(imgParams.scroll.h),
    }
}
