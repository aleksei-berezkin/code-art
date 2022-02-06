export type GlyphRaster = {
    glyphs: Map<string, GlyphMetrics>,
    maxAscent: number,
    // Actual size on tex to passed font size
    sizeRatio: number,
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
