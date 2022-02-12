import { pickRandom } from '../util/pickRandom';
import { getSource, Source } from '../model/Source';
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
import { parseCode } from '../parse/parseCode';
import type { ColorSchemeName } from '../model/colorSchemes';
import { colorSchemes } from '../model/colorSchemes';
import { calcExtensions } from '../model/Extensions';
import { getAdjustedImgParams } from '../model/getAdjustedImgParams';
import { createWorkLimiter, WorkLimiter } from '../util/workLimiter';
import type { GlyphRaster } from '../model/GlyphRaster';
import { defaultMonospace, fontFacesForRandomScenes } from '../model/fontFaces';
import { sourceSpecs } from '../model/sourceSpecs';

export async function drawRandomScene(
    codeCanvasEl: HTMLCanvasElement,
    rasterCanvasEl: HTMLCanvasElement,
    setParams: (p: ImgParams) => void,
) {
    const sourceName = pickRandom(Object.keys(sourceSpecs));
    const source = await getSource(sourceName);

    const sizePixelSpace = getSizePixelSpace(codeCanvasEl);
    const fontFace = pickRandom(fontFacesForRandomScenes);
    const fontSize = getFontSize(sizePixelSpace);

    await loadFont(fontFace, fontSize, source.parseResult.alphabet);

    const workLimiter = createWorkLimiter();
    const glyphRaster = await rasterizeFont(source, rasterCanvasEl, fontFace, fontSize, workLimiter);

    const sceneParams = await generateSceneParams(source, getSizePixelSpace(codeCanvasEl), fontFace, fontSize, glyphRaster, workLimiter);
    await _drawScene(source, sceneParams, glyphRaster, codeCanvasEl, rasterCanvasEl, workLimiter);

    setParams(sceneParams.imgParams);
}

export async function drawScene(
    _imgParams: ImgParams,
    codeCanvasEl: HTMLCanvasElement,
    rasterCanvasEl: HTMLCanvasElement,
    setParams: (p: ImgParams) => void,
) {
    const source = await getSource(_imgParams.source['source'].val);
    const imgParams = getAdjustedImgParams(source, _imgParams);

    const fontFace = imgParams.font.face.val;
    const fontSize = getSliderVal(imgParams.font.size);
    await loadFont(fontFace, fontSize, source.parseResult.alphabet);
    const workLimiter = createWorkLimiter();
    const glyphRaster = await rasterizeFont(source, rasterCanvasEl, fontFace, fontSize, workLimiter);

    const pixelSpace = makePixelSpace(getSizePixelSpace(codeCanvasEl));
    const xAngle = getSliderVal(imgParams.angle.x);
    const yAngle = getSliderVal(imgParams.angle.y);
    const zAngle = getSliderVal(imgParams.angle.z);
    const txMat = getTxMax(pixelSpace, xAngle, yAngle, zAngle);
    const extensions = await calcExtensions(pixelSpace, xAngle, yAngle, zAngle, txMat, workLimiter);
    await delay();
    await _drawScene(source, {pixelSpace, extensions, imgParams, txMat}, glyphRaster, codeCanvasEl, rasterCanvasEl, workLimiter);

    setParams(imgParams);
}

async function _drawScene(source: Source, sceneParams: SceneParams, glyphRaster: GlyphRaster, codeCanvasEl: HTMLCanvasElement, rasterCanvasEl: HTMLCanvasElement, workLimiter: WorkLimiter) {
    const sourceCodeDetails = sourceSpecs[sceneParams.imgParams.source.source.val];
    const parseResult = await parseCode(sourceCodeDetails.url, sourceCodeDetails.lang === 'js min line');
    const colorScheme = colorSchemes[sceneParams.imgParams.color.scheme.val as ColorSchemeName];
    const targetTex = await drawCodeScene(source, colorScheme, parseResult, sceneParams, glyphRaster, codeCanvasEl, rasterCanvasEl, workLimiter);
    await delay();
    await drawEffectsScene(sceneParams, colorScheme.background, targetTex, codeCanvasEl, workLimiter);
}

function getSizePixelSpace(codeCanvasEl: HTMLCanvasElement): Size {
    return {
        w: codeCanvasEl.width / dpr,
        h: codeCanvasEl.height / dpr,
    };
}

function getFontSize(sizePx: Size) {
    return Math.min(36, 18 + sizePx.w / 1280 * 18);
}

async function loadFont(fontFace: string, fontSize: number, alphabet: string) {
    if (fontFace === defaultMonospace) {
        return;
    }

    await document.fonts.load(`${fontSize}px '${fontFace}'`, alphabet);
}
