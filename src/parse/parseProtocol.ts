import type { ParseResult } from '../model/ParseResult';

export type ParseRequestData = {
    url: string,
    softWraps: boolean,
};

export type ParseResponseData = {
    url: string,
    parseResult: ParseResult,
};
