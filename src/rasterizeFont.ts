import { dpr } from './getDpr';

export type RasterLetter = {
    baseline: number,
    ascent: number,
    descent: number,
    x: number,
    w: number,
}

export const fontSizeMultiplier = 2;
const spaceV = 1.1;
const spaceH = 1.15;

export function rasterizeFont(source: string, canvasEl: HTMLCanvasElement, fontSize: number) {
    const ctx = canvasEl.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }
    setWH(canvasEl);

    const _fontSize = fontSize * fontSizeMultiplier;
    const xMin = _fontSize * (spaceH - 1);
    const xMax = canvasEl.width -1.5 *  _fontSize;
    const alphabet = getAlphabet(source);
    const height = estimateNeededCanvasHeight(ctx, xMin, xMax, _fontSize, alphabet.size);
    canvasEl.style.height = `${height}px`;
    setWH(canvasEl);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    ctx.fillStyle = 'white';
    ctx.font = `${_fontSize}px monospace`;

    let x = xMin;
    let baseline = _fontSize;
    const rasterItems: Map<string, RasterLetter> = new Map();

    for (const letter of alphabet) {
        ctx.fillText(letter, x, baseline);
        const tm = ctx.measureText(letter);
        rasterItems.set(
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

    return rasterItems;
}

function getAlphabet(source: string) {
    const alphabet = new Set(source);
    for (let ch = 0; ch < 32; ch++) {
        alphabet.delete(String.fromCharCode(ch));
    }
    return alphabet;
}

function estimateNeededCanvasHeight(ctx: CanvasRenderingContext2D, xMin: number, xMax: number, fontSize: number, alphabetSize: number) {
    const { width } = ctx.measureText('W');
    const glyphsPerLine = Math.floor((xMax - xMin) / width / spaceH);
    const linesEstimate = Math.ceil(alphabetSize / glyphsPerLine) + 1.5;
    return Math.ceil(linesEstimate * fontSize * spaceV);
}

function setWH(canvasEL: HTMLCanvasElement) {
    const { width, height } = canvasEL.getBoundingClientRect();
    canvasEL.width = width * dpr;
    canvasEL.height = height * dpr;
}
