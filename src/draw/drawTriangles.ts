import { delay } from '../util/delay';
import { rect2dSize } from './rect';

const step = rect2dSize * 200;

export async function drawTriangles(size: number, gl: WebGL2RenderingContext) {
    for (let i = 0; i < size; i += step) {
        await delay(50);
        gl.drawArrays(gl.TRIANGLES, i, Math.min(size - i, step));
    }
}
