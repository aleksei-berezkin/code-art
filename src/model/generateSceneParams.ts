import { pickRandom } from '../util/pickRandom';
import type { Source } from './Source';
import type { ImgParams } from './ImgParams';
import { degToRad } from '../util/degToRad';
import { colorSchemeNames } from './colorSchemes';
import { rgbToHex } from './RGB';
import { makePixelSpace, PixelSpace } from './PixelSpace';
import { getTxMax } from './getTxMax';
import type { Mat4 } from '../util/matrices';
import type { Size } from './Size';
import { calcExtensions, Extensions } from './Extensions';
import { generateScrollFractions } from './generateScrollFractions';
import { generateAngles } from './generateAngles';
import type { WorkLimiter } from '../util/workLimiter';
import type { AlphabetRaster } from './AlphabetRaster';
import { fontFaces } from './fontFaces';
import { isMinified } from './Lang';
import { sourceSpecs } from './sourceSpecs';
import { scoreFill } from './scoreFill';
import { attributionPos } from './attributionPos';
import { fitViewRatio, ratios } from './ratios';
import { generate3DifferentBrightColors } from '../util/generate3DifferentBrightColors';

export type SceneParams = {
    pixelSpace: PixelSpace,
    extensions: Extensions,
    txMat: Mat4,
    imgParams: ImgParams,
};

export async function generateSceneParams(currentImgParams: ImgParams | undefined, source: Source, sizePx: Size, fontFace: string, fontSize: number, alphabetRaster: AlphabetRaster, workLimiter: WorkLimiter): Promise<SceneParams> {
    const blurFactorPercentLog = 1.3 + Math.random();

    const samplesCount = isMinified(source.spec.lang) ? 4 : 6;
    const {angles, pixelSpace, txMat, extensions, scrollFraction} = (await Promise.all(Array.from({length: samplesCount})
        .map(async () => {
            await workLimiter.next();

            const angles = generateAngles(isMinified(source.spec.lang));
            const pixelSpace = makePixelSpace(sizePx);
            const txMat = getTxMax(pixelSpace, angles.x, angles.y, angles.z);
            const extensions = await calcExtensions(pixelSpace, angles.x, angles.y, angles.z, txMat, workLimiter);
            // TODO more h options for non-minified; less for minified 
            const scrollFractions = generateScrollFractions(source);

            return await Promise.all(scrollFractions.map(async (scrollFraction) => {
                const score = await scoreFill(source, pixelSpace, extensions, txMat, scrollFraction, fontSize, alphabetRaster, workLimiter);
                return {angles, pixelSpace, txMat, extensions, scrollFraction, score};
            }));
        })))
        .flatMap(p => p)
        .reduce((p, q) => p.score > q.score ? p : q);

    const [glowColor, nearColor, farColor] = generate3DifferentBrightColors();

    const imgParams: ImgParams = {
        source: {
            'source': {
                type: 'choices',
                val: source.name,
                choices: Object.keys(sourceSpecs),
            },
        },
        font: {
            face: {
                type: 'choices',
                val: fontFace,
                choices: fontFaces,
            },
            size: {
                type: 'slider',
                min: 5,
                val: fontSize,
                max: 120,
            },
        },
        scroll: {
            v: {
                type: 'slider',
                min: 0,
                val: scrollFraction.v * 100,
                max: 100,
                unit: '%',
            },
            h: {
                type: 'slider',
                min: 0,
                val: scrollFraction.h * 100,
                max: 100,
                unit: '%',
            },

        },
        'main color': {
            scheme: {
                type: 'choices',
                val: pickRandom(colorSchemeNames),
                choices: colorSchemeNames,
            },
            brightness: {
                type: 'slider',
                min: 0,
                val: 90 + Math.random() * 20,
                max: 300,
                unit: '%',
            },
        },
        angle: {
            x: {
                type: 'slider',
                min: degToRad(-20),
                val: angles.x,
                max: degToRad(20),
                unit: 'rad',
            },
            y: {
                type: 'slider',
                min: degToRad(-20),
                val: angles.y,
                max: degToRad(20),
                unit: 'rad',
            },
            z: {
                type: 'slider',
                min: -Math.PI / 2,
                val: angles.z,
                max: Math.PI / 2,
                unit: 'rad',
            },
        },
        glow: {
            radius: {
                type: 'slider',
                min: 0,
                val: 10 + Math.random() * 60,
                max: 100,
                unit: '%',
            },
            brightness: {
                type: 'slider',
                min: 0,
                val: 10 + Math.random() * 260,
                max: 400,
                unit: '%',
            },
            recolor: {
                type: 'slider',
                min: 0,
                val: Math.random() * 100,
                max: 100,
                unit: '%',
            },
            to: {
                type: 'color',
                val: rgbToHex(glowColor),
            },
        },
        fade: {
            blur: {
                type: 'slider' as const,
                min: 1,
                val: blurFactorPercentLog,
                max: 3,
                unit: 'log10%' as const,
            },
            fade: {
                type: 'slider',
                min: -2,
                val: -1 + Math.random(),
                max: 1,
                unit: 'log10',
            },
            recolor: {
                type: 'slider',
                min: 0,
                val: 1.5 + Math.random() * 2.5,
                max: 4,
            },
            near: {
                type: 'color',
                val: rgbToHex(nearColor),
            },
            far: {
                type: 'color',
                val: rgbToHex(farColor),
            },
        },
        'output image': {
            size: {
                type: 'slider',
                min: 10,
                val: 100,
                max: 100,
                unit: '%',
            },
            ratio: {
                type: 'choices',
                val: currentImgParams ? currentImgParams['output image'].ratio.val : fitViewRatio,
                choices: ratios,
            },
            attribution: {
                type: 'choices',
                val: attributionPos[3],
                choices: attributionPos,
            },
        },
    };

    return {pixelSpace, txMat, extensions, imgParams};
}
