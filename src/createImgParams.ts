import { pickRandom } from './util/pickRandom';
import { sourceCodeNames, sourceDetails } from './souceCode';
import type { ImgParams } from './ImgParams';
import { degToRad } from './util/degToRad';
import { colorSchemeNames } from './colorSchemes';
import { RGB, rgbToHex } from './util/RGB';

export function createImgParams(): ImgParams {
    const sourceName = pickRandom(sourceCodeNames);
    const isMinified = sourceDetails[sourceName].lang === 'js min';

    const p = genRotationPatterns(isMinified);

    const angleX = p.has('xSmall') ? randomAngle(4, 7) * randomSign()
        : p.has('xMed') ? randomAngle(7, 12) * randomSign()
        : p.has('xLarge') ? randomAngle(12, 15) * randomSign()
        : 0;

    const angleY = p.has('ySmall') ? randomAngle(4, 10) * (isMinified ? randomSign() : 1)
        : p.has('yMed') ? randomAngle(10, 16) * (isMinified ? randomSign() : 1)
        : p.has('yLarge') ? randomAngle(16, 20) * (isMinified ? randomSign() : 1)
        : 0;

    const angleZ = (isMinified || Math.abs(angleX) < degToRad(5) && Math.abs(angleY) < degToRad(7))
        ? randomAngle(1.5, 3.5) * randomSign()
        : 0;

    return {
        'angle x': {
            type: 'slider',
            min: degToRad(-20),
            val: angleX,
            max: degToRad(20),
        },
        'angle y': {
            type: 'slider',
            min: degToRad(-20),
            val: angleY,
            max: degToRad(20),
        },
        'angle z': {
            type: 'slider',
            min: -Math.PI / 2,
            val: angleZ,
            max: Math.PI / 2,
        },
        'translate x': {
            type: 'slider',
            // percent
            min: -100,
            val: 0,
            max: 100,
        },
        'translate y': {
            type: 'slider',
            min: -100,
            val: 0,
            max: 100,
        },
        'translate z': {
            type: 'slider',
            min: -100,
            val: 0,
            max: 100,
        },
        'scroll': {
            type: 'slider',
            min: 0,
            val: Math.random() * 100,
            max: 100,
        },
        'font size': {
            type: 'slider',
            min: 5,
            val: 36,
            max: 120,
        },
        'color scheme': {
            type: 'choices',
            val: pickRandom(colorSchemeNames),
            choices: colorSchemeNames,
        },
        'source': {
            type: 'choices',
            val: sourceName,
            choices: sourceCodeNames,
        },
        'glow amplification': {
            type: 'slider',
            min: 0,
            val: 1 + Math.random() * 1.2,
            max: 4,
        },
        'glow color shift': {
            type: 'slider',
            min: 0,
            val: Math.random() * 100,
            max: 100,
        },
        'glow shifted color': {
            type: 'color',
            // TODO good colors in col scheme
            val: rgbToHex(Array.from({length: 3}).map(() => .25 + .75 * Math.random()) as RGB),
        },
        'glow radius': {
            type: 'slider',
            min: 0,
            val: 20 + Math.random() * 40,
            max: 100,
        },
        'fade in distortion': {
            type: 'color',
            val: rgbToHex(Array.from({length: 3}).map(() => .25 + .75 * Math.random()) as RGB),
        },
        'fade out distortion': {
            type: 'color',
            val: rgbToHex(Array.from({length: 3}).map(() => .25 + .75 * Math.random()) as RGB),
        },
        'blur': {
            type: 'slider',
            // % log10
            min: 1,
            val: 1.3 + Math.random(),
            max: 3,
        },
        'color amplification': {
            type: 'slider',
            min: 0,
            val: .9 + Math.random() * .2,
            max: 3,
        },
        'fade': {
            type: 'slider',
            // log10
            min: -2,
            val: -1 + Math.random(),
            max: 1,
        },
        'fade distortion': {
            type: 'slider',
            min: 0,
            val: 1.5 + Math.random() * 2.5,
            max: 4,
        }
    };
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
