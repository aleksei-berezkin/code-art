import { delay } from '../util/delay';
import type { IsInterrupted } from '../util/interrupted';

const step = 4800;

export async function drawTriangles(size: number, gl: WebGL2RenderingContext, isInterrupted: IsInterrupted) {
    for (let i = 0; i < size; i += step) {
        await delay(isInterrupted);
        gl.drawArrays(gl.TRIANGLES, i, Math.min(size - i, step));
    }
}
