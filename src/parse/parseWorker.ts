import type { ShortColorKey } from '../model/ShortColorKey';
import type { Options, Token } from 'acorn';
import type { ParseRequestData, ParseResponseData } from './parseProtocol';
// @ts-ignore
import * as acornLoose from 'acorn-loose';
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';
import type { ParseResult } from '../model/ParseResult';

self.onmessage = async function (msg: {data: ParseRequestData}) {
    const text = await (await fetch(msg.data.url)).text();
    const parseResult = parse(text);
    const respData: ParseResponseData = {
        url: msg.data.url,
        parseResult,
    };
    self.postMessage(respData);
} 

function parse(text: string): ParseResult {
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
            } else if ([acorn.tokTypes.string, acorn.tokTypes.template, acorn.tokTypes.backQuote].includes(token.type)) {
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

    return {
        colorization: colorKeys,
    };
}
