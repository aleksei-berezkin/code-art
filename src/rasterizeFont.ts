import { dpr } from './getDpr';
import * as acorn from 'acorn';

const fontSizeMultiplier = 2;
const spaceV = 1.15;
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

    const _fontSize = fontSize * fontSizeMultiplier;
    ctx.fillStyle = 'white';
    ctx.font = `${_fontSize}px monospace`;

    const xMin = _fontSize * (spaceH - 1);
    let x = xMin;

    let yBaseline = _fontSize;
    for (const letter of alphabet) {
        ctx.fillText(letter, x, yBaseline);
        const tm = ctx.measureText(letter);
    
        ctx.strokeStyle = 'magenta';
        ctx.rect(x, yBaseline + tm.actualBoundingBoxDescent, tm.width, -tm.actualBoundingBoxDescent-tm.actualBoundingBoxAscent);
        ctx.stroke();

        x += tm.width * spaceH;
        if (x >= canvasEl.width -1.5 *  _fontSize) {
            x = xMin;
            yBaseline += _fontSize * spaceV;
        }
    }

    const ast = acorn.parse('const a = {x: 0, y: 1}', {ecmaVersion: 'latest', allowAwaitOutsideFunction: true});
    console.log(ast);
}

function setWH(canvasEL: HTMLCanvasElement) {
    const { width, height } = canvasEL.getBoundingClientRect();
    canvasEL.width = width * dpr;
    canvasEL.height = height * dpr;
}
