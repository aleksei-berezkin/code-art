import * as acorn from 'acorn';
// @ts-ignore
import * as acornLoose from 'acorn-loose';
import * as acornWalk from 'acorn-walk';
import type { Options, Token } from 'acorn';
import type { ColorScheme, ColorSchemeName, RGBA } from './ColorScheme';
import { colorSchemes } from './ColorScheme';

let source: Source | undefined = undefined;

export type Source = {
    text: string,
    bgColor: RGBA,
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
    const colorScheme = getRandomColorScheme();
    return {
        text,
        bgColor: colorScheme.background,
        colors: highlight(text, colorScheme),
        linesOffsets: getLinesOffsets(text),
    };
}

function getRandomColorScheme(): ColorScheme {
    const names = Object.keys(colorSchemes) as ColorSchemeName[];
    const name = names[Math.floor(Math.random() * names.length)];
    return colorSchemes[name];
}

function highlight(text: string, scheme: ColorScheme): RGBA[] {
    const colors: RGBA[] = [];
    function colorize(start: number, end: number, color: RGBA) {
        for (let i = start; i < end; i++) {
            colors[i] = color;
        }
    }

    const options: Options = {
        ecmaVersion: 'latest',
        onComment(isBlock, text, start, end) {
            colorize(start, end, scheme.comment);
        },
        onToken(token: Token) {
            let color;
            if (acorn.tokTypes.num === token.type) {
                color = scheme.number;
            } else if (acorn.tokTypes.string === token.type) {
                color = scheme.string;
            } else if (acorn.tokTypes.name === token.type) {
                color = scheme.name;
            } else if (['class', 'const', 'false', 'function', 'in', 'let', 'new', 'null', 'of', 'this', 'true', 'undefined', 'var']
                .includes(token.type.keyword)
            ) {
                color = scheme.keyword1;
            } else if (token.type.keyword) {
                color = scheme.keyword2;
            } else {
                color = scheme.default;
            }

            colorize(token.start, token.end, color);
        },
    };

    acornWalk.simple(
        acornLoose.parse(text, options),
        {
            MemberExpression(node: any) {
                if (!node.computed) {
                    colorize(node.property.start, node.property.end, scheme.member);
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
