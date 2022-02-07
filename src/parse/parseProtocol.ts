import type { ParseResult } from '../model/ParseResult';

export type ParseRequestData = {
    url: string,
};

export type ParseResponseData = {
    url: string,
    parseResult: ParseResult,
};
