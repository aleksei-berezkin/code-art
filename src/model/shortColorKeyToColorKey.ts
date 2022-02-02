import type { ColorKey } from './colorSchemes';
import type { ShortColorKey } from './ShortColorKey';

// It's easier to typecheck this way
const colorKeyToShort: {[k in ColorKey]: ShortColorKey} = {
    background: 'b',
    comment: 'c',
    number: 'n',
    string: 's',
    name: 'N',
    member: 'm',
    keyword1: 'k',
    keyword2: 'K',
    default: 'd',
}

export type ShortColorKeyToColorKey = {
    [k in ShortColorKey]: ColorKey
};

export const shortColorKeyToColorKey: ShortColorKeyToColorKey =
    Object.fromEntries(
        Object.entries(colorKeyToShort)
            .map(([key, shortKey]) => [shortKey, key])
    ) as ShortColorKeyToColorKey;

if (Object.keys(shortColorKeyToColorKey).length !== Object.keys(colorKeyToShort).length) {
    throw new Error('Bad colors mapping');
}
