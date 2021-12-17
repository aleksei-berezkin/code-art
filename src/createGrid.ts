import { rect3dConstZ, vertexSize3d } from './rect';

// TODO origin at 0,0 to avoid colors change on xMin, yMin change
export function createGrid(xMin: number, yMin: number, xMax: number, yMax: number, z: number, cellWidth: number, cellHeight: number): Grid {
    const vertices = [];
    const colors = [];
    const _xMin = Math.floor(xMin / cellWidth) * cellWidth;
    const _yMin = Math.floor(yMin / cellHeight) * cellHeight;
    for (let y = _yMin; y <= yMax; y += cellHeight) {
        for (let x = _xMin; x <= xMax; x += cellWidth) {
            const rectVertices = rect3dConstZ(x, y, x + cellWidth, y + cellHeight, z)
            vertices.push(...rectVertices);

            const color = [
                pseudoRandom(Math.abs(x + 1.18971), Math.abs(y * 7.79721)),
                pseudoRandom(Math.abs(x * 3.83929), Math.abs(y + 2.88179)),
                pseudoRandom(Math.abs(x + 8.84979), Math.abs(y * 5.31311)),
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
