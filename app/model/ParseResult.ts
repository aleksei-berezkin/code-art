// index = pos in text
import type { ShortColorKey } from './ShortColorKey'

// start, end exclusively
export type Line = [number, number]
export type Lines = Line[]

export type ParseResult = {
    colorization: ShortColorKey[],
    lines: Lines,
    lineLengthChars: number,
    // Always includes space; never includes with code < 32; always sorted
    alphabet: string,
}
