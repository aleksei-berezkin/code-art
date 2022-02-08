import type { ImgParams } from './ImgParams';
import { getScrollFraction } from './ScrollFraction';
import type { Source } from './Source';
import { getScrollParam } from './scrollParam';

export function getAdjustedImgParams(source: Source, imgParams: ImgParams) {
    return {
        ...imgParams,
        scroll: getScrollParam(source, getScrollFraction(imgParams)),
    };
}
