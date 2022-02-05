import { pickRandom } from '../util/pickRandom';
import { Source, sourceCodeNames } from './souceCode';
import type { ImgParams } from './ImgParams';
import { degToRad } from '../util/degToRad';
import { colorSchemeNames } from './colorSchemes';
import { RGB, rgbToHex } from './RGB';
import { makePixelSpace, PixelSpace } from './PixelSpace';
import type { GlyphRaster } from '../draw/rasterizeFont';
import { getTxMax } from './getTxMax';
import type { Mat4 } from '../util/matrices';
import type { Size } from './Size';
import { getSceneBounds } from './SceneBounds';
import { calcExtensions, Extensions } from './Extensions';
import { delay } from '../util/delay';
import { generateScrollFraction } from './generateScrollFraction';
import { generateAngles } from './generateAngles';

export type SceneParams = {
    pixelSpace: PixelSpace,
    extensions: Extensions,
    txMat: Mat4,
    imgParams: ImgParams,
};

export async function generateSceneParams(source: Source, sizePx: Size, fontSize: number, glyphRaster: GlyphRaster): Promise<SceneParams> {
    const blurFactorPercentLog = 1.3 + Math.random();

    const angles = generateAngles(source.lang === 'js min')

    const pixelSpace = makePixelSpace(sizePx);
    const txMat = getTxMax(pixelSpace, angles.x, angles.y, angles.z);
    const extensions = await calcExtensions(pixelSpace, angles.x, angles.y, angles.z, txMat);
    await delay();
    const scrollFraction = generateScrollFraction(source, getSceneBounds(pixelSpace, extensions), txMat, fontSize, glyphRaster);

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
        scroll: {
            // TODO patch min/max on lang change
            v: {
                type: 'slider',
                min: -20,
                val: scrollFraction.v * 100,
                max: 120,
                unit: '%',
            },
            h: {
                type: 'slider',
                min: -20,
                val: scrollFraction.h * 100,
                max: 120,
                unit: '%',
            },
        },
        font: {
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
                choices: sourceCodeNames,
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
