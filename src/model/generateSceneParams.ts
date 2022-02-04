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
import { getSceneBounds, SceneBounds } from './SceneBounds';
import { calcExtensions, Extensions } from './Extensions';
import { scoreFill } from './scoreFill';
import { delay } from '../util/delay';

export type SceneParams = {
    pixelSpace: PixelSpace,
    extensions: Extensions,
    txMat: Mat4,
    imgParams: ImgParams,
};

export async function generateSceneParams(source: Source, sizePx: Size, fontSize: number, glyphRaster: GlyphRaster): Promise<SceneParams> {
    const blurFactorPercentLog = 1.3 + Math.random();

    const angles = createAngles(source.lang === 'js min')

    const pixelSpace = makePixelSpace(sizePx);
    const txMat = getTxMax(pixelSpace, angles.x, angles.y, angles.z, 0, 0, 0);
    const extensions = await calcExtensions(pixelSpace, angles.x, angles.y, angles.z, txMat);
    await delay();
    const scrollFraction = genScrollFraction(source, getSceneBounds(pixelSpace, extensions), txMat, fontSize, glyphRaster);

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
        position: {
            'scroll': {
                type: 'slider',
                min: 0,
                val: scrollFraction * 100,
                max: 100,
                unit: '%',
            },
            x: {
                type: 'slider',
                min: -100,
                val: 0,
                max: 100,
                unit: '%',
            },
            y: {
                type: 'slider',
                min: -100,
                val: 0,
                max: 100,
                unit: '%',
            },
            z: {
                type: 'slider',
                min: -100,
                val: 0,
                max: 100,
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

function createAngles(isMinified: boolean) {
    const p = genRotationPatterns(isMinified);

    const x = p.has('xSmall') ? randomAngle(4, 7) * randomSign()
        : p.has('xMed') ? randomAngle(7, 11) * randomSign()
        : p.has('xLarge') ? randomAngle(10, 13) * randomSign()
        : 0;

    const y = p.has('ySmall') ? randomAngle(4, 10) * (isMinified ? randomSign() : -1)
        : p.has('yMed') ? randomAngle(10, 13) * (isMinified ? randomSign() : -1)
        : p.has('yLarge') ? randomAngle(13, 15) * (isMinified ? randomSign() : -1)
        : 0;

    const z = (isMinified || Math.abs(x) < degToRad(5) && Math.abs(y) < degToRad(7))
        ? randomAngle(1.5, 3.5) * randomSign()
        : 0;

    return {x, y, z};
}

type RotPattern = 'xSmall' | 'xMed' | 'xLarge' | 'ySmall' | 'yMed' | 'yLarge';

function genRotationPatterns(isMinified: boolean): Set<RotPattern | undefined> {
    const xOptions: (RotPattern | undefined)[] = isMinified
        ? [undefined, 'xSmall', 'xMed', 'xLarge']
        : [undefined, 'xSmall', 'xMed'];
    const yOptions: (RotPattern | undefined)[] = isMinified
        ? [undefined, 'ySmall', 'yMed', 'yLarge']
        : [undefined, 'ySmall', 'yMed'];

    const x = pickRandom<RotPattern | undefined>(xOptions);
    const y = pickRandom<RotPattern | undefined>(yOptions);

    if (!isMinified && x === 'xMed' && y === 'yMed'
        || x === 'xSmall' && y === undefined
        || x === undefined && y === 'ySmall'
        || x === undefined && y === undefined
    ) {
        return genRotationPatterns(isMinified);
    }

    return new Set([x, y]);
}

function randomAngle(degMin: number, degMax: number) {
    return degToRad(degMin) + Math.random() * degToRad(degMax - degMin);
}

function randomSign() {
    return Math.random() < .5 ? -1 : 1;
}

function genScrollFraction(source: Source, sceneBounds: SceneBounds, txMat: Mat4, fontSize: number, glyphRaster: GlyphRaster) {
    if (source.lang === 'js min') {
        return Math.random();
    }

    return Array.from({length: 9})
        .map(() => {
            const scrollFraction = Math.random();
            return {
                scrollFraction,
                score: scoreFill(source, sceneBounds, txMat, scrollFraction, fontSize, glyphRaster),
            }
        })
        .reduce((a, b) => a.score > b.score ? a : b)
        .scrollFraction;
}
