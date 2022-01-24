// @ts-ignore
import * as acornLoose from 'acorn-loose';
import type { Source } from './souceCode';
import type { ColorScheme } from './ColorScheme';
import type { Options, Token } from 'acorn';
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';
import type { ColorSchemeName } from './colorSchemes';
import { colorSchemes } from './colorSchemes';
import type { RGB } from './RGB';

export type CodeColorization = {
    bgColor: RGB,
    colors: RGB[],  // index = pos in text
}

export function colorizeCode(source: Source, colorSchemeName: ColorSchemeName): CodeColorization {
    const cacheKey = JSON.stringify([source.name, colorSchemeName])

    if (idToColorizationCache.has(cacheKey)) {
        return idToColorizationCache.get(cacheKey)!;
    }

    const colorScheme = colorSchemes[colorSchemeName];
    const colorization = {
        bgColor: colorScheme.background,
        colors: highlight(source.text, colorScheme),
    };
    idToColorizationCache.set(cacheKey, colorization);
    return colorization;
}

const idToColorizationCache: Map<string, CodeColorization> = new Map();

function highlight(text: string, scheme: ColorScheme): RGB[] {
    const colors: RGB[] = [];
    function colorize(start: number, end: number, color: RGB) {
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

    // noinspection JSUnusedGlobalSymbols
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
