import * as acorn from 'acorn';
// @ts-ignore
import * as acornLoose from 'acorn-loose';
import * as acornWalk from 'acorn-walk';
import type { Options, Token } from 'acorn';
import type { RGBA } from './hexToRgba';
import { hexToRgba } from './hexToRgba';

let source: Source | undefined = undefined;

export type Source = {
    text: string,
    colors: RGBA[],         // index = pos in text
    linesOffsets: number[], // index = pos in text
}

export async function getSource(): Promise<Source> {
    if (source) {
        return source;
    }
    // const r = await fetch('https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js');
    const r = await fetch('https://unpkg.com/lodash@4.17.21/lodash.min.js');
    if (source) {
        return source;
    }
    const text = await r.text();
    return {
        text,
        colors: highlight(text),
        linesOffsets: getLinesOffsets(text),
    };
}

const commentColor = hexToRgba('#6a9954');
const numColor = hexToRgba('#b5cea8');
const stringColor = hexToRgba('#ce9178');
const nameColor = hexToRgba('#9cdcfe');
const keyword1Color = hexToRgba('#569cd6');
const keyword2Color = hexToRgba('#c586c0');
const defaultColor = hexToRgba('#e4e4e4');
const memberColor = hexToRgba('#dcdcaa');

function highlight(text: string): RGBA[] {
    const colors: RGBA[] = [];
    function colorize(start: number, end: number, color: RGBA) {
        for (let i = start; i < end; i++) {
            colors[i] = color;
        }
    }

    const options: Options = {
        ecmaVersion: 'latest',
        onComment(isBlock, text, start, end) {
            colorize(start, end, commentColor);
        },
        onToken(token: Token) {
            let color;
            if (acorn.tokTypes.num === token.type) {
                color = numColor;
            } else if (acorn.tokTypes.string === token.type) {
                color = stringColor;
            } else if (acorn.tokTypes.name === token.type) {
                color = nameColor;
            } else if (['class', 'const', 'false', 'function', 'in', 'let', 'new', 'null', 'of', 'this', 'true', 'undefined', 'var']
                .includes(token.type.keyword)
            ) {
                color = keyword1Color;
            } else if (token.type.keyword) {
                color = keyword2Color;
            } else {
                color = defaultColor;
            }

            colorize(token.start, token.end, color);
        },
    };

    acornWalk.simple(
        acornLoose.parse(text, options),
        {
            MemberExpression(node: any) {
                if (!node.computed) {
                    colorize(node.property.start, node.property.end, memberColor);
                }
            },
        },
    );
    
    return colors;
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
