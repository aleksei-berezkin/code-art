import { degToRad } from '../util/degToRad';
import { pickRandom } from '../util/pickRandom';

export function generateAngles(isMinified: boolean) {
    const p = generateRotationPatterns(isMinified);

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

function generateRotationPatterns(isMinified: boolean): Set<RotPattern | undefined> {
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
        return generateRotationPatterns(isMinified);
    }

    return new Set([x, y]);
}

function randomAngle(degMin: number, degMax: number) {
    return degToRad(degMin) + Math.random() * degToRad(degMax - degMin);
}

function randomSign() {
    return Math.random() < .5 ? -1 : 1;
}
