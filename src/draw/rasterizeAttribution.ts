import { dpr } from '../util/dpr';

const pad = {
    aboveAscent: .4,
    belowBaseline: .6,
    left: .55,
    right: .55,
}

export async function rasterizeAttribution(text: string, fontSize: number, canvasEl: HTMLCanvasElement) {
    const _fontSize = .9 * fontSize * dpr;
    const fontCssStr = `300 ${_fontSize}px 'Roboto'`;
    await document.fonts.load(fontCssStr, text)

    const ctx = canvasEl.getContext('2d')!;

    ctx.font = fontCssStr;
    const metrics = ctx.measureText(text);

    canvasEl.width = metrics.width + (pad.left + pad.right) * _fontSize;
    canvasEl.height = pad.aboveAscent * _fontSize + metrics.actualBoundingBoxAscent + pad.belowBaseline * _fontSize;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    ctx.fillStyle = 'white';
    ctx.font = fontCssStr;

    ctx.fillText(text, pad.left * _fontSize, pad.aboveAscent * _fontSize + metrics.actualBoundingBoxAscent);
}
