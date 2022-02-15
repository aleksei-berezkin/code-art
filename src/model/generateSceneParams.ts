import { pickRandom } from '../util/pickRandom';
import type { Source } from './Source';
import type { ImgParams } from './ImgParams';
import { degToRad } from '../util/degToRad';
import { colorSchemeNames } from './colorSchemes';
import { RGB, rgbToHex } from './RGB';
import { makePixelSpace, PixelSpace } from './PixelSpace';
import { getTxMax } from './getTxMax';
import type { Mat4 } from '../util/matrices';
import type { Size } from './Size';
import { getSceneBounds } from './SceneBounds';
import { calcExtensions, Extensions } from './Extensions';
import { delay } from '../util/delay';
import { generateScrollFraction } from './generateScrollFraction';
import { generateAngles } from './generateAngles';
import { getScrollParam } from './scrollParam';
import type { WorkLimiter } from '../util/workLimiter';
import type { AlphabetRaster } from './AlphabetRaster';
import { fontFaces } from './fontFaces';
import { isMinified } from './Lang';
import { sourceSpecs } from './sourceSpecs';
import type { ScrollFraction } from './ScrollFraction';

export type SceneParams = {
    pixelSpace: PixelSpace,
    extensions: Extensions,
    txMat: Mat4,
    imgParams: ImgParams,
};

export async function generateSceneParams(source: Source, sizePx: Size, fontFace: string, fontSize: number, alphabetRaster: AlphabetRaster, workLimiter: WorkLimiter): Promise<SceneParams> {
    const blurFactorPercentLog = 1.3 + Math.random();

    let angles: ReturnType<typeof generateAngles>;
    let pixelSpace: PixelSpace;
    let txMat: Mat4;
    let extensions: Extensions;
    let scrollFraction: ScrollFraction;
    for ( ; ; ) {
        await workLimiter.next();

        angles = generateAngles(isMinified(source.spec.lang));
        pixelSpace = makePixelSpace(sizePx);
        txMat = getTxMax(pixelSpace, angles.x, angles.y, angles.z);
        extensions = await calcExtensions(pixelSpace, angles.x, angles.y, angles.z, txMat, workLimiter);
        const _scrollFraction = await generateScrollFraction(source, getSceneBounds(pixelSpace, extensions), angles.y, txMat, fontSize, alphabetRaster, workLimiter);
        if (_scrollFraction) {
            scrollFraction = _scrollFraction;
            break;
        }
    }
    

    const imgParams: ImgParams = {
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
        scroll: getScrollParam(source, scrollFraction),
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
        source: {
            'source': {
                type: 'choices',
                val: source.name,
                choices: Object.keys(sourceSpecs),
            },
        },
        color: {
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
        glow: {
            radius: {
                type: 'slider',
                min: 0,
                val: 20 + Math.random() * 40,
                max: 100,
                unit: '%',
            },
            brightness: {
                type: 'slider',
                min: 0,
                val: 100 + Math.random() * 120,
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
                // TODO good colors in col scheme
                val: rgbToHex(Array.from({length: 3}).map(() => .25 + .75 * Math.random()) as RGB),
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
                val: rgbToHex(Array.from({length: 3}).map(() => .25 + .75 * Math.random()) as RGB),
            },
            far: {
                type: 'color',
                val: rgbToHex(Array.from({length: 3}).map(() => .25 + .75 * Math.random()) as RGB),
            },
        },
    };

    return {pixelSpace, txMat, extensions, imgParams};
}
