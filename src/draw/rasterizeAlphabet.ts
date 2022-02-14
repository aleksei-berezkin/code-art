import { dpr } from '../util/dpr';
import type { Source } from '../model/Source';
import type { WorkLimiter } from '../util/workLimiter';
import type { GlyphMetrics, AlphabetRaster } from '../model/AlphabetRaster';
import { defaultMonospace } from '../model/fontFaces';

const fontSizeMultiplier = 2;
const spaceV = 1.15;
const spaceH = 1.05;

const dsAlphabet = 'alphabet';
const dsFontFace = 'fontFace';
const dsFontSize = 'fontSize';
let cachedRaster: AlphabetRaster | undefined = undefined;

export async function rasterizeAlphabet(
    source: Source,
    canvasEl: HTMLCanvasElement,
    fontFace: string,
    fontSize: number,
    workLimiter: WorkLimiter,
): Promise<AlphabetRaster> {
    if (cachedRaster
        && canvasEl.dataset[dsAlphabet] === source.parseResult.alphabet
        && canvasEl.dataset[dsFontFace] === String(fontFace)
        && canvasEl.dataset[dsFontSize] === String(fontSize)
    ) {
        return cachedRaster;
    }

    await loadFont(fontFace, fontSize, source.parseResult.alphabet);
    
    const ctx = canvasEl.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    const _fontSize = fontSize * dpr * fontSizeMultiplier;
    const cssFontStr = `${_fontSize}px ${fontFace === defaultMonospace ? 'monospace' : ("'" + fontFace + "'")}`;
    const xMin = _fontSize * (spaceH - 1);
    const xMax = canvasEl.width - 1.5 *  _fontSize;
    canvasEl.height = estimateNeededCanvasHeight(ctx, xMin, xMax, cssFontStr, _fontSize, source.parseResult.alphabet.length);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    ctx.fillStyle = 'white';

    ctx.font = cssFontStr;

    let x = xMin;
    let baseline = _fontSize;
    const glyphs: Map<string, GlyphMetrics> = new Map();

    for (const letter of source.parseResult.alphabet) {
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

    const _glyphs = [...glyphs.values()];
    const maxAscent = _glyphs
        .reduce((max, r) => r.ascent > max ? r.ascent : max, 0);
    const maxDescent = _glyphs
        .reduce((max, r) => r.descent > max ? r.descent : max, 0);
    const avgW = _glyphs
        .reduce((s, g) => s + g.w, 0)
        / _glyphs.length;


    canvasEl.dataset[dsAlphabet] = source.parseResult.alphabet;
    canvasEl.dataset[dsFontFace] = String(fontFace);
    canvasEl.dataset[dsFontSize] = String(fontSize);

    cachedRaster =  {
        fontSizeRatio: _fontSize / fontSize,
        glyphs,
        maxAscent,
        maxDescent,
        avgW,
    };

    return cachedRaster;
}

function estimateNeededCanvasHeight(ctx: CanvasRenderingContext2D, xMin: number, xMax: number, cssFontStr: string, fontSize: number, alphabetSize: number) {
    ctx.fillStyle = 'white';
    ctx.font = cssFontStr;

    const { width } = ctx.measureText('W');
    const glyphsPerLine = Math.floor((xMax - xMin) / width / spaceH);
    const linesEstimate = Math.ceil(alphabetSize / glyphsPerLine) + 1.5;
    return Math.ceil(linesEstimate * fontSize * spaceV);
}

async function loadFont(fontFace: string, fontSize: number, alphabet: string) {
    if (fontFace === defaultMonospace) {
        return;
    }

    await document.fonts.load(`${fontSize}px '${fontFace}'`, alphabet);
}
