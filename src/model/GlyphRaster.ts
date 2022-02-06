export type GlyphRaster = {
    glyphs: Map<string, GlyphMetrics>,
    // Actual size on tex which may be greater than rendered font size
    fontSize: number,
    maxAscent: number,
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
