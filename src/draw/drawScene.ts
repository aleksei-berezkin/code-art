import { pickRandom } from '../util/pickRandom';
import { getSource, Source, SourceCodeName, sourceCodeNames } from '../model/souceCode';
import { GlyphRaster, rasterizeFont } from './rasterizeFont';
import { generateSceneParams, SceneParams } from '../model/generateSceneParams';
import { dpr } from '../util/dpr';
import type { ImgParams } from '../model/ImgParams';
import { drawCodeScene } from './drawCodeScene';
import { drawEffectsScene } from './drawEffectsScene';
import { calcExtensions, makePixelSpace } from '../model/PixelSpace';
import { getSliderVal } from '../model/ImgParams';
import { getTxMax } from '../model/getTxMax';
import type { Size } from '../util/Size';
import { delay } from '../util/delay';
import { colorizeCode } from '../model/colorizeCode';
import type { ColorSchemeName } from '../model/colorSchemes';
import { throttle } from '../util/throttle';

export async function drawRandomScene(fontSize: number, codeCanvasEl: HTMLCanvasElement, rasterCanvasEl: HTMLCanvasElement, setImgParams: (p: ImgParams) => void) {
    throttle(async function () {
        const sourceName = pickRandom(sourceCodeNames);
        const source = await getSource(sourceName);
    
        const glyphRaster = rasterizeFont(source, rasterCanvasEl, fontSize);
        await delay();
    
        const sceneParams = generateSceneParams(getPixelSpaceSize(codeCanvasEl), fontSize, source, glyphRaster);
        await _drawScene(source, sceneParams, glyphRaster, codeCanvasEl, rasterCanvasEl);
    
        setImgParams(sceneParams.imgParams);
    })
}

export async function drawScene(imgParams: ImgParams, codeCanvasEl: HTMLCanvasElement, rasterCanvasEl: HTMLCanvasElement) {
    throttle(async function () {
        const source = await getSource(imgParams.source['source'].val as SourceCodeName)
    
        const glyphRaster = rasterizeFont(source, rasterCanvasEl, getSliderVal(imgParams.font.size));
        await delay();
    
        const pixelSpace = makePixelSpace(getPixelSpaceSize(codeCanvasEl), getSliderVal(imgParams.fade.blur));
        const xAngle = getSliderVal(imgParams.angle.x);
        const yAngle = getSliderVal(imgParams.angle.y);
        const zAngle = getSliderVal(imgParams.angle.z);
        const extensions = calcExtensions(pixelSpace, xAngle, yAngle, zAngle);
        const txMat = getTxMax(pixelSpace,
            xAngle, yAngle, zAngle,
            getSliderVal(imgParams.position.x),
            getSliderVal(imgParams.position.y),
            getSliderVal(imgParams.position.z),
        );
        await _drawScene(source, {pixelSpace, extensions, imgParams, txMat}, glyphRaster, codeCanvasEl, rasterCanvasEl);
    })
}

async function _drawScene(source: Source, sceneParams: SceneParams, glyphRaster: GlyphRaster, codeCanvasEl: HTMLCanvasElement, rasterCanvasEl: HTMLCanvasElement) {
    const codeColorization = colorizeCode(source, sceneParams.imgParams.color.scheme.val as ColorSchemeName);
    await delay();
    const targetTex = await drawCodeScene(source, codeColorization, sceneParams, glyphRaster, codeCanvasEl, rasterCanvasEl);
    await delay();
    await drawEffectsScene(sceneParams, codeColorization.bgColor, targetTex, codeCanvasEl);
}

function getPixelSpaceSize(codeCanvasEl: HTMLCanvasElement): Size {
    return {
        w: codeCanvasEl.width / dpr,
        h: codeCanvasEl.height / dpr,
    }
}
