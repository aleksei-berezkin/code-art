import { pickRandom } from '../util/pickRandom';
import { getSource, Source } from '../model/Source';
import { rasterizeAlphabet } from './rasterizeAlphabet';
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
import { createWorkLimiter, WorkLimiter } from '../util/workLimiter';
import type { AlphabetRaster } from '../model/AlphabetRaster';
import { fontFacesForRandomScenes } from '../model/fontFaces';
import { sourceSpecs } from '../model/sourceSpecs';
import { rasterizeAttribution } from './rasterizeAttribution';
import { drawAttributionScene } from './drawAttributionScene';

export async function drawRandomScene(
    codeCanvasEl: HTMLCanvasElement,
    alphabetCanvasEl: HTMLCanvasElement,
    attributionCanvasEl: HTMLCanvasElement,
    selfAttrCanvasEl: HTMLCanvasElement,
    setParams: (p: ImgParams) => void,
) {
    const sourceName = pickRandom(Object.keys(sourceSpecs));
    const source = await getSource(sourceName);

    const sizePixelSpace = getSizePixelSpace(codeCanvasEl);
    const fontFace = pickRandom(fontFacesForRandomScenes);
    const fontSize = getFontSize(sizePixelSpace);

    const workLimiter = createWorkLimiter();
    const alphabetRaster = await rasterizeAlphabet(source, alphabetCanvasEl, fontFace, fontSize, workLimiter);

    const sceneParams = await generateSceneParams(source, getSizePixelSpace(codeCanvasEl), fontFace, fontSize, alphabetRaster, workLimiter);
    await _drawScene(source, sceneParams, alphabetRaster, codeCanvasEl, alphabetCanvasEl, attributionCanvasEl, selfAttrCanvasEl, workLimiter);

    setParams(sceneParams.imgParams);
}

export async function drawScene(
    imgParams: ImgParams,
    codeCanvasEl: HTMLCanvasElement,
    alphabetCanvasEl: HTMLCanvasElement,
    attributionCanvasEl: HTMLCanvasElement,
    selfAttrCanvasEl: HTMLCanvasElement,
) {
    const source = await getSource(imgParams.source['source'].val);

    const fontFace = imgParams.font.face.val;
    const fontSize = getSliderVal(imgParams.font.size);
    const workLimiter = createWorkLimiter();
    const alphabetRaster = await rasterizeAlphabet(source, alphabetCanvasEl, fontFace, fontSize, workLimiter);

    const pixelSpace = makePixelSpace(getSizePixelSpace(codeCanvasEl));
    const xAngle = getSliderVal(imgParams.angle.x);
    const yAngle = getSliderVal(imgParams.angle.y);
    const zAngle = getSliderVal(imgParams.angle.z);
    const txMat = getTxMax(pixelSpace, xAngle, yAngle, zAngle);
    const extensions = await calcExtensions(pixelSpace, xAngle, yAngle, zAngle, txMat, workLimiter);
    await delay();
    await _drawScene(source, {pixelSpace, extensions, imgParams, txMat}, alphabetRaster, codeCanvasEl, alphabetCanvasEl, attributionCanvasEl, selfAttrCanvasEl, workLimiter);
}

async function _drawScene(source: Source, sceneParams: SceneParams, alphabetRaster: AlphabetRaster, codeCanvasEl: HTMLCanvasElement, alphabetCanvasEl: HTMLCanvasElement, attributionCanvasEl: HTMLCanvasElement, selfAttrCanvasEl: HTMLCanvasElement, workLimiter: WorkLimiter) {
    const sourceCodeDetails = sourceSpecs[sceneParams.imgParams.source.source.val];
    const parseResult = await parseCode(sourceCodeDetails.url, sourceCodeDetails.lang === 'js min line');
    const colorScheme = colorSchemes[sceneParams.imgParams['main color'].scheme.val as ColorSchemeName];
    const codeTex = await drawCodeScene(source, colorScheme, parseResult, sceneParams, alphabetRaster, codeCanvasEl, alphabetCanvasEl, workLimiter);
    await delay();
    const targetTex = await drawEffectsScene(sceneParams, colorScheme.background, codeTex, codeCanvasEl, workLimiter);
    await rasterizeAttribution(source.spec.credit, sceneParams.imgParams.font.size.val, attributionCanvasEl);
    await rasterizeAttribution('code-art.app', sceneParams.imgParams.font.size.val, selfAttrCanvasEl);
    await delay();
    await drawAttributionScene(sceneParams, targetTex, colorScheme, codeCanvasEl, attributionCanvasEl, selfAttrCanvasEl);
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
