import { pickRandom } from './util/pickRandom';
import { sourceCodeNames, sourceDetails } from './souceCode';
import type { ImgParams } from './ImgParams';
import { degToRad } from './util/degToRad';
import { colorSchemeNames } from './colorSchemes';
import {  RGB, rgbToHex } from './util/RGB';

export function createImgParams(): ImgParams {
    const sourceName = pickRandom(sourceCodeNames);
    const isMinified = sourceDetails[sourceName].lang === 'js min';

    return {
        'angle x': {
            type: 'slider',
            min: degToRad(-20),
            val: isMinified
                ? degToRad(-15) + Math.random() * degToRad(30)
                : degToRad(-5) + Math.random() * degToRad(10),
            max: degToRad(20),
        },
        'angle y': {
            type: 'slider',
            min: degToRad(-20),
            val: isMinified
                ? degToRad(-15) + Math.random() * degToRad(30)
                : degToRad(20) * Math.random(),
            max: degToRad(20),
        },
        'angle z': {
            type: 'slider',
            min: -Math.PI / 2,
            // TODO 0 or some minimal
            val: Math.PI / 2 * (isMinified
                    ? -.05 + Math.random() * .1
                    : -.025 + Math.random() * .05
            ),
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