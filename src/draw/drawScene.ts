import { pickRandom } from '../util/pickRandom';
import { getSource, Source, SourceCodeName, sourceCodeNames, sourceDetails } from '../model/souceCode';
import { rasterizeFont } from './rasterizeFont';
import { generateSceneParams, SceneParams } from '../model/generateSceneParams';
import { dpr } from '../util/dpr';
import type { ImgParams } from '../model/ImgParams';
import { drawCodeScene } from './drawCodeScene';
import { drawEffectsScene } from './drawEffectsScene';
import { makePixelSpace } from '../model/PixelSpace';
import { getSliderVal } from '../model/ImgParams';
import { getTxMax } from '../model/getTxMax';
import type { Size } from '../model/Size';
import { delay } from '../util/delay';
import { colorizeCode } from '../model/colorizeCode';
import type { ColorSchemeName } from '../model/colorSchemes';
import { throttle, throttleFast } from '../util/throttle';
import { colorSchemes } from '../model/colorSchemes';
import { calcExtensions } from '../model/Extensions';
import { getAdjustedImgParams } from '../model/getAdjustedImgParams';
import { createWorkLimiter, WorkLimiter } from '../util/workLimiter';
import type { GlyphRaster } from '../model/GlyphRaster';

export async function drawRandomScene(codeCanvasEl: HTMLCanvasElement, rasterCanvasEl: HTMLCanvasElement, setImgParams: (p: ImgParams) => void) {
    throttleFast(async function () {
        const sourceName = pickRandom(sourceCodeNames);
        const source = await getSource(sourceName);
    
        const sizePx = getSizePx(codeCanvasEl);
        const fontSize = getFontSize(sizePx);

        const workLimiter = createWorkLimiter();
        const glyphRaster = await rasterizeFont(source, rasterCanvasEl, fontSize, workLimiter);
    
        const sceneParams = await generateSceneParams(source, getSizePx(codeCanvasEl), fontSize, glyphRaster, workLimiter);
        await _drawScene(source, sceneParams, glyphRaster, codeCanvasEl, rasterCanvasEl, workLimiter);
    
        setImgParams(sceneParams.imgParams);
    })
}

export async function drawScene(_imgParams: ImgParams, codeCanvasEl: HTMLCanvasElement, rasterCanvasEl: HTMLCanvasElement, setImgParams: (p: ImgParams) => void) {
    throttle(async function () {
        const source = await getSource(_imgParams.source['source'].val as SourceCodeName)
        const imgParams = getAdjustedImgParams(source, _imgParams);

        const workLimiter = createWorkLimiter();
        const glyphRaster = await rasterizeFont(source, rasterCanvasEl, getSliderVal(imgParams.font.size), workLimiter);
    
        const pixelSpace = makePixelSpace(getSizePx(codeCanvasEl));
        const xAngle = getSliderVal(imgParams.angle.x);
        const yAngle = getSliderVal(imgParams.angle.y);
        const zAngle = getSliderVal(imgParams.angle.z);
        const txMat = getTxMax(pixelSpace, xAngle, yAngle, zAngle);
        const extensions = await calcExtensions(pixelSpace, xAngle, yAngle, zAngle, txMat, workLimiter);
        await delay();
        await _drawScene(source, {pixelSpace, extensions, imgParams, txMat}, glyphRaster, codeCanvasEl, rasterCanvasEl, workLimiter);

        setImgParams(imgParams);
    });
}

async function _drawScene(source: Source, sceneParams: SceneParams, glyphRaster: GlyphRaster, codeCanvasEl: HTMLCanvasElement, rasterCanvasEl: HTMLCanvasElement, workLimiter: WorkLimiter) {
    const codeColorization = await colorizeCode(sourceDetails[sceneParams.imgParams.source.source.val as SourceCodeName].url);
    const colorScheme = colorSchemes[sceneParams.imgParams.color.scheme.val as ColorSchemeName];
    const targetTex = await drawCodeScene(source, colorScheme, codeColorization, sceneParams, glyphRaster, codeCanvasEl, rasterCanvasEl, workLimiter);
    await delay();
    await drawEffectsScene(sceneParams, colorScheme.background, targetTex, codeCanvasEl);
}

function getSizePx(codeCanvasEl: HTMLCanvasElement): Size {
    return {
        w: codeCanvasEl.width / dpr,
        h: codeCanvasEl.height / dpr,
    };
}

function getFontSize(sizePx: Size) {
    return Math.min(36, 18 + sizePx.w / 1280 * 18);
}
