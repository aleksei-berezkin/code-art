// @ts-ignore
import * as acornLoose from 'acorn-loose';
import type { Source } from './souceCode';
import type { Options, Token } from 'acorn';
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';
import type { ShortColorKey } from './ShortColorKey';

// index = pos in text
export type CodeColorization = ShortColorKey[];

export function colorizeCode(source: Source): CodeColorization {
    const cacheKey = source.name;

    if (idToColorizationCache.has(cacheKey)) {
        return idToColorizationCache.get(cacheKey)!;
    }

    const colorization = highlight(source.text);
    idToColorizationCache.set(cacheKey, colorization);
    return colorization;
}

const idToColorizationCache: Map<string, CodeColorization> = new Map();

function highlight(text: string): CodeColorization {
    const colorKeys: ShortColorKey[] = [];
    function colorize(start: number, end: number, colorKey: ShortColorKey) {
        for (let i = start; i < end; i++) {
            colorKeys[i] = colorKey;
        }
    }

    const options: Options = {
        ecmaVersion: 'latest',
        onComment(isBlock, text, start, end) {
            colorize(start, end, 'c');
        },
        onToken(token: Token) {
            let color: ShortColorKey;
            if (acorn.tokTypes.num === token.type) {
                color = 'n';
            } else if (acorn.tokTypes.string === token.type) {
                color = 's';
            } else if (acorn.tokTypes.name === token.type) {
                color = 'N';
            } else if (['class', 'const', 'false', 'function', 'in', 'let', 'new', 'null', 'of', 'this', 'true', 'undefined', 'var']
                .includes(token.type.keyword)
            ) {
                color = 'k';
            } else if (token.type.keyword) {
                color = 'K';
            } else {
                color = 'd';
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
                    colorize(node.property.start, node.property.end, 'm');
                }
            },
        },
    );

    return colorKeys;
}
