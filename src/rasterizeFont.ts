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

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    const alphabet = new Set(source);
    alphabet.delete('\n');
    alphabet.delete('\r');

    const _fontSize = fontSize * fontSizeMultiplier;
    ctx.fillStyle = 'white';
    ctx.font = `${_fontSize}px monospace`;

    const xMin = _fontSize * (spaceH - 1);
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
        if (x >= canvasEl.width -1.5 *  _fontSize) {
            x = xMin;
            baseline += _fontSize * spaceV;
        }
    }

    return rasterItems;
}

function setWH(canvasEL: HTMLCanvasElement) {
    const { width, height } = canvasEL.getBoundingClientRect();
    canvasEL.width = width * dpr;
    canvasEL.height = height * dpr;
}
