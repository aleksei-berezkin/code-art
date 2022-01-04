let source: Source | undefined = undefined;

export type Source = {
    id: string,
    lang: 'js',
    text: string,
    linesOffsets: number[], // value = pos in text
}

export const sourceCodeNames = ['React DOM min'];

export async function getSource(): Promise<Source> {
    if (source) {
        return source;
    }
    const url = 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js';
    // const url = 'https://unpkg.com/lodash@4.17.21/lodash.min.js';
    const r = await fetch(url);
    if (source) {
        return source;
    }
    const text = await r.text();
    return {
        id: url,
        lang: 'js',
        text,
        linesOffsets: getLinesOffsets(text),
    };
}

function getLinesOffsets(text: string): number[] {
    const offsets: number[] = [0];
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n' && i < text.length - 1) {
            offsets.push(i + 1);
        }
    }
    return offsets;
}
