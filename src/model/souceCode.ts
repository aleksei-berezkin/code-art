import { pluck } from '../util/pluck';

export const sourceDetails = {
    'React DOM min': {
        lang: 'js min' as const,
        url: 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js',
    },
    'Lodash min': {
        lang: 'js min' as const,
        url: 'https://unpkg.com/lodash@4.17.21/lodash.min.js',
    },
    'webpack: PackFileCacheStrategy': {
        lang: 'js' as const,
        url: 'https://raw.githubusercontent.com/webpack/webpack/6941c519e901629a6dfcd736ac191771cd3ac03e/lib/cache/PackFileCacheStrategy.js',
    },
    'vue: patch': {
        lang: 'js' as const,
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
}

export async function getSource(name: SourceCodeName): Promise<Source> {
    if (name in cache) {
        return cache.get(name)!;
    }

    const text = await (await fetch(sourceDetails[name].url)).text();

    const source = {
        name,
        lang: sourceDetails[name].lang,
        text,
        linesOffsets: getLinesOffsets(text),
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
