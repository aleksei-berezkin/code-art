import { dpr } from '../util/dpr';
import type { Source } from '../model/souceCode';
import type { WorkLimiter } from '../util/workLimiter';
import type { GlyphMetrics, GlyphRaster } from '../model/GlyphRaster';

const fontSizeMultiplier = 2;
const spaceV = 1.05;
const spaceH = 1.05;

const dsSourceId = 'sourceId';
const dsFontSize = 'fontSize';
let cachedRaster: GlyphRaster | undefined = undefined;

export async function rasterizeFont(
    source: Source,
    canvasEl: HTMLCanvasElement,
    fontSize: number,
    workLimiter: WorkLimiter,
): Promise<GlyphRaster> {
    if (cachedRaster && canvasEl.dataset[dsSourceId] === source.name && canvasEl.dataset[dsFontSize] === String(fontSize)) {
        return cachedRaster;
    }

    const ctx = canvasEl.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    const _fontSize = fontSize * dpr * fontSizeMultiplier;
    const xMin = _fontSize * (spaceH - 1);
    const xMax = canvasEl.width - 1.5 *  _fontSize;
    const alphabet = await getAlphabet(source.text, workLimiter);
    canvasEl.height = estimateNeededCanvasHeight(ctx, xMin, xMax, _fontSize, alphabet.size);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    ctx.fillStyle = 'white';
    ctx.font = `${_fontSize}px monospace`;

    let x = xMin;
    let baseline = _fontSize;
    const glyphs: Map<string, GlyphMetrics> = new Map();

    for (const letter of alphabet) {
        await workLimiter.next();
        ctx.fillText(letter, x, baseline);
        const tm = ctx.measureText(letter);
        glyphs.set(
            letter,
            {
                baseline,
                ascent: tm.actualBoundingBoxAscent,
                descent: tm.actualBoundingBoxDescent,
                x,
                w: tm.width,
            },
        );
    
        x += tm.width * spaceH;
        if (x >= xMax) {
            x = xMin;
            baseline += _fontSize * spaceV;
        }
    }

    const sizeRatio = _fontSize / fontSize;
    const _glyphs = [...glyphs.values()];
    const maxAscent = _glyphs
        .reduce((max, r) => r.ascent > max ? r.ascent : max, 0);
    const avgW = _glyphs
        .reduce((s, g) => s + g.w, 0)
        / _glyphs.length;


    canvasEl.dataset[dsSourceId] = source.name;
    canvasEl.dataset[dsFontSize] = String(fontSize);
    cachedRaster =  {
        fontSize: _fontSize,
        glyphs,
        maxAscent,
        avgW,
    };

    return cachedRaster;
}

async function getAlphabet(source: string, workLimiter: WorkLimiter) {
    const alphabet = new Set(source);
    for (let ch = 0; ch < 32; ch++) {
        await workLimiter.next();
        alphabet.delete(String.fromCharCode(ch));
    }
    alphabet.add(' ');  // If it happens that no spaces, only tabs
    return alphabet;
}

function estimateNeededCanvasHeight(ctx: CanvasRenderingContext2D, xMin: number, xMax: number, fontSize: number, alphabetSize: number) {
    ctx.fillStyle = 'white';
    ctx.font = `${fontSize}px monospace`;

    const { width } = ctx.measureText('W');
    const glyphsPerLine = Math.floor((xMax - xMin) / width / spaceH);
    const linesEstimate = Math.ceil(alphabetSize / glyphsPerLine) + 1.5;
    return Math.ceil(linesEstimate * fontSize * spaceV);
}
