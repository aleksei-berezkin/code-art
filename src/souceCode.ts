const sourceDetails = {
    'React DOM min': {
        lang: 'js' as const,
        url: 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js',
    },
    'Lodash min': {
        lang: 'js' as const,
        url: 'https://unpkg.com/lodash@4.17.21/lodash.min.js',
    },
    'webpack: PackFileCacheStrategy': {
        lang: 'js' as const,
        url: 'https://raw.githubusercontent.com/webpack/webpack/main/lib/cache/PackFileCacheStrategy.js',
    },
};

export type SourceCodeName = keyof typeof sourceDetails;

export const sourceCodeNames = Object.keys(sourceDetails) as SourceCodeName[];

export type Source = {
    id: SourceCodeName,
    lang: 'js',
    text: string,
    linesOffsets: number[], // value = pos in text
}

export async function getSource(name: SourceCodeName): Promise<Source> {
    if (name in cache) {
        return cache.get(name)!;
    }

    const r = await fetch(sourceDetails[name].url);
    const text = await r.text();

    const source = {
        id: name,
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