import * as acorn from 'acorn';
import type { Token } from 'acorn';

let source: Source | undefined = undefined;

type RGBA = [number, number, number, number];

export type Source = {
    text: string,
    colors: RGBA[],    // index = pos in text
}

export async function getSource(): Promise<Source> {
    if (source) {
        return source;
    }
    const r = await fetch('https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js');
    if (source) {
        return source;
    }
    const text = await r.text();
    source = {
        text,
        colors: highlight(text),
    }
    return source;
}

const numLiteral: RGBA = [.5, .8, 1, 1];
const reserved: RGBA = [.1, .5, .6, 1];
const string: RGBA = [.3, .7, .3, 1];
const nameCol: RGBA = [.7, .9, .3, 1];

function highlight(text: string): RGBA[] {
    const colors: RGBA[] = [];
    for (const token of acorn.tokenizer(text, {ecmaVersion: 'latest'})) {
        if (acorn.tokTypes.num === token.type) {
            colorize(token, numLiteral, colors);
        } else if (token.type.keyword) {
            colorize(token, reserved, colors);
        } else if (acorn.tokTypes.string === token.type) {
            colorize(token, string, colors);
        } else if (acorn.tokTypes.name === token.type) {
            colorize(token, nameCol, colors);
        }
    }
    return colors;
}

function colorize(token: Token, color: RGBA, colors: RGBA[]) {
    for (let i = token.start; i < token.end; i++) {
        colors[i] = color;
    }
}
