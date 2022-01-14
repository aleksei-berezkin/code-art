import { pickRandom } from './util/pickRandom';
import {getSource, getSourceStartLine, getSourceStartPos, Source, sourceCodeNames, sourceDetails} from './souceCode';
import type { ImgParams } from './ImgParams';
import { degToRad } from './util/degToRad';
import { colorSchemeNames } from './colorSchemes';
import { RGB, rgbToHex } from './util/RGB';
import {
    calcExtensions,
    Extensions,
    getSceneBounds,
    getSceneLinesNum,
    makePixelSpace,
    PixelSpace,
    SceneBounds
} from './PixelSpace';

export async function createSpaceAndImgParams(w: number, h: number): Promise<{pixelSpace: PixelSpace, extensions: Extensions, source: Source, imgParams: ImgParams}> {
    const blurFactorLogPercent = 1.3 + Math.random();

    const sourceName = pickRandom(sourceCodeNames);

    const angles = createAngles(sourceDetails[sourceName].lang === 'js min')

    const pixelSpace = makePixelSpace(w, h, 10 ** (blurFactorLogPercent - 2 /* -2 because percent */));
    const extensions = calcExtensions(pixelSpace, angles.x, angles.y, angles.z);

    const fontSize = 36;
    const source = await getSource(sourceName);
    const scrollFraction = genScrollFraction(source, getSceneBounds(pixelSpace, extensions), angles.x, fontSize);

    const imgParams: ImgParams = {
        'angle x': {
            type: 'slider',
            min: degToRad(-20),
            val: angles.x,
            max: degToRad(20),
        },
        'angle y': {
            type: 'slider',
            min: degToRad(-20),
            val: angles.y,
            max: degToRad(20),
        },
        'angle z': {
            type: 'slider',
            min: -Math.PI / 2,
            val: angles.z,
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
            val: scrollFraction * 100,
            max: 100,
        },
        'font size': {
            type: 'slider',
            min: 5,
            val: fontSize,
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
            val: blurFactorLogPercent,
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

    return {pixelSpace, extensions, source, imgParams};
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

function genScrollFraction(source: Source, sceneBounds: SceneBounds, xAngle: number, fontSize: number) {
    if (source.lang === 'js min') {
        return Math.random();
    }

    const best = Array.from({length: 5})
        .map(() => {
            const scrollFraction = Math.random();
            return {
                scrollFraction,
                score: scoreScroll(source, sceneBounds, xAngle, scrollFraction, fontSize),
            }
        })
        .reduce((a, b) => a.score > b.score ? a : b);
    console.log('scoreeeee', best.score);
    return best.scrollFraction;
}

function scoreScroll(source: Source, sceneBounds: SceneBounds, xAngle: number, scrollFraction: number, fontSize: number) {
    const linesNum = getSceneLinesNum(sceneBounds, fontSize);
    const startLine = getSourceStartLine(source, linesNum, scrollFraction);
    const linesScores = Array.from({length: linesNum})
        .map((_, l) => scoreLine(source, startLine + l));

    if (xAngle === 0) {
        return linesScores.reduce((s, t) => s + t);
    }

    if (xAngle < 0) {
        // Upper lines are farther, so start from lower non-discounted
        linesScores.reverse();
    }

    return linesScores
        .map((score, i) => score * Math.exp(-i / 20))
        .reduce((s, t) => s + t);
}

function scoreLine(source: Source, lineNum: number) {
    if (lineNum >= source.linesOffsets.length) {
        return 0;
    }

    const startPos = source.linesOffsets[lineNum];
    const lineLength = lineNum === source.linesOffsets.length
        ? source.text.length - startPos
        : source.linesOffsets[lineNum + 1] - startPos;

    let leadingSpaces = 0;
    for (let i = startPos; i < startPos + lineLength; i++) {
        if (source.text.charCodeAt(i) <= 32) {
            leadingSpaces++;
        } else {
            break;
        }
    }

    return lineLength / (leadingSpaces + 1);
}
