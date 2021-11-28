import { rect3dConstZ, vertexSize3d } from './rect';

export function createGrid(width: number, height: number, depth: number, cellWidth: number, cellHeight: number): Grid {
    const z = depth / 2;
    const vertices = [];
    const colors = [];
    for (let y = 0; y < height; y += cellHeight) {
        for (let x = 0; x < width; x += cellWidth) {
            const rectVertices = rect3dConstZ(x, y, x + cellWidth, y + cellHeight, z)
            vertices.push(...rectVertices);

            const color = [
                pseudoRandom(x * 1.18971, y * 7.79721),
                pseudoRandom(x * 3.83929, y * 2.88179),
                pseudoRandom(x * 8.84979, y * 5.31311),
                1,
            ];
            const verticesNum = rectVertices.length / vertexSize3d;
            colors.push(
                ...Array.from({length: verticesNum})
                    .flatMap(() => color)
            );
        }
    }
    return {vertices, colors};
}

const initial = .54267;
const multiplier = 1.8839553

function pseudoRandom(...args: number[]): number {
    let h = initial;
    for (const a of args) {
        h = h * multiplier + a;
    }
    return (h * multiplier) % 1;
}

export type Grid = {
    vertices: number[],
    colors: number[],
}
