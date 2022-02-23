import type { ShortColorKey } from '../model/ShortColorKey';
import type { ParseRequestData, ParseResponseData } from './parseProtocol';
import type { Line, Lines, ParseResult } from '../model/ParseResult';

import type { Options, Token } from 'acorn';
// @ts-ignore
import * as acornLoose from 'acorn-loose';
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';

self.onmessage = async function (msg: {data: ParseRequestData}) {
    const text = await (await fetch(msg.data.url)).text();
    const parseResult = parse(text, msg.data.insertWraps);
    const respData: ParseResponseData = {
        url: msg.data.url,
        parseResult,
    };
    self.postMessage(respData);
} 

function parse(text: string, insertWraps: boolean): ParseResult {
    const colorKeys: ShortColorKey[] = [];
    function colorize(start: number, end: number, colorKey: ShortColorKey) {
        for (let i = start; i < end; i++) {
            colorKeys[i] = colorKey;
        }
    }

    const strPositions = new Set<number>();

    function addStrPositions(start: number, end: number) {
        if (insertWraps) {
            for (let i = start; i < end; i++) {
                strPositions.add(i);
            }
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
                addStrPositions(token.start, token.end);
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
            TemplateLiteral(node: any) {
                addStrPositions(node.start, node.end);
            },
        },
    );

    const lines = getLines(text, strPositions, insertWraps);
    // This works best for scroll
    const longestLines = lines
        .map(([start, end]) => end - start)
        .sort((l, m) => m - l)
        .slice(0, 10);
    const lineLengthChars = longestLines.reduce((a, b) => a + b) / longestLines.length;

    return {
        colorization: colorKeys,
        lines,
        lineLengthChars,
        alphabet: getAlphabet(text),
    };
}

function getLines(text: string, strPositions: Set<number>, insertWraps: boolean): Lines {
    const origLines = getOriginalLines(text);
    if (!insertWraps) {
        return origLines;
    }

    return insertWrapsToLongLines(text, strPositions, origLines);
}

function getOriginalLines(text: string): Lines {
    const lines: ParseResult['lines'] = [];
    let lastNewLineIndex = -1;
    for ( ; ; ) {
        const newlineIndex = text.indexOf('\n', lastNewLineIndex + 1);
        if (newlineIndex !== -1) {
            lines.push([lastNewLineIndex + 1, newlineIndex]);
            lastNewLineIndex = newlineIndex;
        } else {
            lines.push([lastNewLineIndex + 1, text.length]);
            return lines;
        }
    }
}

const targetLineLen = 400;

function insertWrapsToLongLines(text: string, strPositions: Set<number>, lines: Lines): Lines {
    return lines
        .flatMap(([start, end]) => [...splitLongLine(text, strPositions, start, end)]);
}

const charsToSplitAfter = new Set(['(', '[', '{', ':', ',', ';']);

function* splitLongLine(text: string, strPositions: Set<number>, start: number, endExclusive: number): Generator<Line> {
    if (start === endExclusive) {
        return;
    }

    if (endExclusive - start <= targetLineLen) {
        yield [start, endExclusive];
        return;
    }

    for (let pos = start + targetLineLen - 1; pos < endExclusive - 1; pos++) {
        if (!strPositions.has(pos) && charsToSplitAfter.has(text[pos])) {
            yield [start, pos + 1];
            yield* splitLongLine(text, strPositions, pos + 1, endExclusive);
            return;
        }
    }

    yield [start, endExclusive];
}

function getAlphabet(source: string) {
    const alphabet = new Set(source);
    for (let ch = 0; ch < 32; ch++) {
        alphabet.delete(String.fromCharCode(ch));
    }
    alphabet.add(' ');
    return [...alphabet].sort().join('');
}
