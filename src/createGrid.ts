import {rect, rect3dConstZ, vertexSize3d } from './rect';
import type {RasterLetter} from "./rasterizeFont";
import {fontSizeMultiplier} from "./rasterizeFont";

export function createGrid(xMin: number, yMin: number,
                           xMax: number, yMax: number,
                           z: number,
                           source: string, fontSize: number, lettersMap: Map<string, RasterLetter>,
): Grid {
    const vertices = [];
    const texPosition = [];
    const colors = [];

    const lRasters = [...lettersMap.values()];
    const avgW = lRasters.reduce((sum, r) => sum + r.w, 0) / lRasters.length;
    const maxAscent = lRasters.reduce((max, r) => r.ascent > max ? r.ascent : max, 0);

    const lines = source.split(/[\r\n]+/);

    const _xMin = Math.floor(xMin / avgW) * avgW;
    const _yMin = Math.floor(yMin / fontSize) * fontSize;
    for (let i = 0, y = _yMin;
         i < lines.length && y <= yMax;
         y += fontSize, i++
    ) {
        const baseline = y + maxAscent;
        const line = lines[i];
        for (let j = 0, x = _xMin;
             j < line.length && x <= xMax;
             j++
        ) {
            const letter = line[j];
            const r = lettersMap.get(letter)!;
            const rectVertices = rect3dConstZ(
                x, baseline - r.ascent / fontSizeMultiplier,
                x + r.w / fontSizeMultiplier, baseline + r.descent / fontSizeMultiplier,
                z,
            )
            vertices.push(...rectVertices);

            texPosition.push(...rect(
                r.x, r.baseline - r.ascent,
                r.x + r.w, r.baseline + r.descent,
            ));

            const color = !!/[$_a-zA-Z]/.exec(letter) ? [1, .8, .9, 1]
                : !!/[0-9]/.exec(letter) ? [.8, .8, 1, 1]
                : !!/["']/.exec(letter) ? [.8, 1, .7, 1]
                : [1, 1, 1, 1];
            const verticesNum = rectVertices.length / vertexSize3d;
            colors.push(
                ...Array.from({length: verticesNum})
                    .flatMap(() => color)
            );

            x += r.w / fontSizeMultiplier;
        }
    }
    console.log(texPosition);
    return {vertices, texPosition, colors};
}

export type Grid = {
    vertices: number[],
    texPosition: number[],
    colors: number[],
}
