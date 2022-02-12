import { delay } from '../util/delay';
import { rect2dSize } from './rect';

const step = rect2dSize * 50;

export async function drawTriangles(size: number, gl: WebGL2RenderingContext) {
    for (let i = 0; i < size; i += step) {
        await delay(80);
        gl.drawArrays(gl.TRIANGLES, i, Math.min(size - i, step));
    }
}
