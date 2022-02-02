import { pickRandom } from '../util/pickRandom';
import { getSource, Source, SourceCodeName, sourceCodeNames, sourceDetails } from '../model/souceCode';
import { GlyphRaster, rasterizeFont } from './rasterizeFont';
import { generateSceneParams, SceneParams } from '../model/generateSceneParams';
import { dpr } from '../util/dpr';
import type { ImgParams } from '../model/ImgParams';
import { drawCodeScene } from './drawCodeScene';
import { drawEffectsScene } from './drawEffectsScene';
import { makePixelSpace } from '../model/PixelSpace';
import { getSliderVal } from '../model/ImgParams';
import { getTxMax } from '../model/getTxMax';
import type { Size } from '../util/Size';
import { delay } from '../util/delay';
import { colorizeCode } from '../model/colorizeCode';
import type { ColorSchemeName } from '../model/colorSchemes';
import { throttle, throttleFast } from '../util/throttle';
import { colorSchemes } from '../model/colorSchemes';
import { calcExtensions } from '../model/Extensions';

export async function drawRandomScene(fontSize: number, codeCanvasEl: HTMLCanvasElement, rasterCanvasEl: HTMLCanvasElement, setImgParams: (p: ImgParams) => void) {
    throttleFast(async function () {
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
        const txMat = getTxMax(pixelSpace,
            xAngle, yAngle, zAngle,
            getSliderVal(imgParams.position.x),
            getSliderVal(imgParams.position.y),
            getSliderVal(imgParams.position.z),
        );
        const extensions = calcExtensions(pixelSpace, xAngle, yAngle, zAngle, txMat);
        await _drawScene(source, {pixelSpace, extensions, imgParams, txMat}, glyphRaster, codeCanvasEl, rasterCanvasEl);
    })
}

async function _drawScene(source: Source, sceneParams: SceneParams, glyphRaster: GlyphRaster, codeCanvasEl: HTMLCanvasElement, rasterCanvasEl: HTMLCanvasElement) {
    const codeColorization = await colorizeCode(sourceDetails[sceneParams.imgParams.source.source.val as SourceCodeName].url);
    const colorScheme = colorSchemes[sceneParams.imgParams.color.scheme.val as ColorSchemeName];
    const targetTex = await drawCodeScene(source, colorScheme, codeColorization, sceneParams, glyphRaster, codeCanvasEl, rasterCanvasEl);
    await delay();
    await drawEffectsScene(sceneParams, colorScheme.background, targetTex, codeCanvasEl);
}

function getPixelSpaceSize(codeCanvasEl: HTMLCanvasElement): Size {
    return {
        w: codeCanvasEl.width / dpr,
        h: codeCanvasEl.height / dpr,
    };
}
