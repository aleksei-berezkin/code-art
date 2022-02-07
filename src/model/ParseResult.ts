// index = pos in text
import type { ShortColorKey } from './ShortColorKey';

export type ParseResult = {
    colorization: ShortColorKey[],
    lines: {
        start: number,
        // Excluding
        end: number,
    }[],
    longestLineLength: number,
    avgLineLength: number,
    // Always includes space; never includes with code < 32; always sorted
    alphabet: string,
};
