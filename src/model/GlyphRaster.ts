export type GlyphRaster = {
    glyphs: Map<string, GlyphMetrics>,
    fontSizeRatio: number,
    maxAscent: number,
    maxDescent: number,
    // Not regarding letters frequency
    avgW: number,
}
export type GlyphMetrics = {
    baseline: number,
    ascent: number,
    descent: number,
    x: number,
    w: number,
}
