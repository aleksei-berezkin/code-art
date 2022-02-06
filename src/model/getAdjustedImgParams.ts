import type { ImgParams } from './ImgParams';
import { getScrollFraction } from './ScrollFraction';
import type { Source } from './souceCode';
import { getScrollParam } from './scrollParam';

export function getAdjustedImgParams(source: Source, imgParams: ImgParams) {
    return {
        ...imgParams,
        // TODO reset h scroll to 0 for min
        scroll: getScrollParam(source, getScrollFraction(imgParams)),
    };
}
