import { delay } from '../util/delay';

const step = 1200;

export async function drawTriangles(size: number, gl: WebGL2RenderingContext) {
    for (let i = 0; i < size; i += step) {
        await delay();
        gl.drawArrays(gl.TRIANGLES, i, Math.min(size - i, step));
    }
}
