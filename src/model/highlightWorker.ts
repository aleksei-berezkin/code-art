import type { ShortColorKey } from './ShortColorKey';
import type { Options, Token } from 'acorn';
// @ts-ignore
import * as acornLoose from 'acorn-loose';
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';
import type { CodeColorization, HighlightRequestData, HighlightResponseData } from './highlightProtocol';


self.onmessage = function (msg: {data: HighlightRequestData}) {
    const colorization = highlight(msg.data.text);
    const respData: HighlightResponseData = {
        id: msg.data.id,
        colorization,
    };
    self.postMessage(respData);
} 

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
