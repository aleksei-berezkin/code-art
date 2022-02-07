import type { Lang } from './Lang';
import type { WorkLimiter } from '../util/workLimiter';

export const sourceDetails = {
    'React DOM min': {
        lang: 'js min' as Lang,
        url: 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js',
    },
    'Lodash min': {
        lang: 'js min' as Lang,
        url: 'https://unpkg.com/lodash@4.17.21/lodash.min.js',
    },
    'webpack: PackFileCacheStrategy': {
        lang: 'js' as Lang,
        url: 'https://raw.githubusercontent.com/webpack/webpack/6941c519e901629a6dfcd736ac191771cd3ac03e/lib/cache/PackFileCacheStrategy.js',
    },
    'vue: patch': {
        lang: 'js' as Lang,
        url: 'https://raw.githubusercontent.com/vuejs/vue/52608302e9bca84fb9e9f0499e89acade78d3d07/src/core/vdom/patch.js',
    },
};

export type SourceCodeName = keyof typeof sourceDetails;

export const sourceCodeNames = Object.keys(sourceDetails) as SourceCodeName[];

export type Source = {
    name: SourceCodeName,
    lang: 'js' | 'js min',
    text: string,
    linesOffsets: number[], // value = pos in text
    longestLineLength: number,
    avgLineLength: number,
    // Always includes space; never includes with code < 32
    alphabet: string,
}

export async function getSource(name: SourceCodeName, workLimiter: WorkLimiter): Promise<Source> {
    if (name in cache) {
        return cache.get(name)!;
    }

    const text = await (await fetch(sourceDetails[name].url)).text();

    const linesOffsets = getLinesOffsets(text);
    const longestLineLength = linesOffsets
        .map((offset, i) => {
            if (i < linesOffsets.length - 1) {
                return linesOffsets[i + 1] - offset - 1;
            }
            return text.length - offset;
        })
        .reduce((a, b) => a > b ? a : b);
    const avgLineLength = text.length / linesOffsets.length;
    const source = {
        name,
        lang: sourceDetails[name].lang,
        text,
        linesOffsets,
        longestLineLength,
        avgLineLength,
        alphabet: await getAlphabet(text, workLimiter),
    };
    cache.set(name, source);
    return source;
}

const cache: Map<SourceCodeName, Source> = new Map();


function getLinesOffsets(text: string): number[] {
    const offsets: number[] = [0];
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n' && i < text.length - 1) {
            offsets.push(i + 1);
        }
    }
    return offsets;
}

async function getAlphabet(source: string, workLimiter: WorkLimiter) {
    await workLimiter.next();
    const alphabet = new Set(source);
    await workLimiter.next();
    for (let ch = 0; ch < 32; ch++) {
        alphabet.delete(String.fromCharCode(ch));
    }
    alphabet.add(' ');
    return [...alphabet].sort().join('');
}
