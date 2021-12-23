import {rect2d, rect3dConstZ, vertexSize3d } from './rect';
import type {RasterLetter} from "./rasterizeFont";
import {fontSizeMultiplier} from "./rasterizeFont";
import type {Source} from "./getSource";

export function createGrid(xMin: number, yMin: number,
                           xMax: number, yMax: number,
                           z: number,
                           source: Source, fontSize: number, lettersMap: Map<string, RasterLetter>,
): Grid {
    const vertices = [];
    const texPosition = [];
    const colors = [];

    const lRasters = [...lettersMap.values()];
    const avgW = lRasters.reduce((sum, r) => sum + r.w, 0) / lRasters.length;
    const maxAscent = lRasters.reduce((max, r) => r.ascent > max ? r.ascent : max, 0);

    const _xMin = Math.floor(xMin / avgW) * avgW;
    const _yMin = Math.floor(yMin / fontSize) * fontSize;

    let x = _xMin;
    let y = _yMin;
    for (let i = 0; i < source.text.length; i++) {
        let letter = source.text[i];
        if (letter === '\n') {
            x = _xMin;
            y += fontSize;
            if (y > yMax) {
                break;
            }
            continue;
        }

        if (x > xMax) {
            continue;
        }

        if (letter.charCodeAt(0) < 32) {
            if (letter === '\t') {
                letter = ' ';
            } else {
                continue;
            }
        }

        const baseline = y + maxAscent;
        const r = lettersMap.get(letter)!;

        const rectVertices = rect3dConstZ(
            x, baseline - r.ascent / fontSizeMultiplier,
            x + r.w / fontSizeMultiplier, baseline + r.descent / fontSizeMultiplier,
            z,
        )
        vertices.push(...rectVertices);

        texPosition.push(...rect2d(
            r.x, r.baseline - r.ascent,
            r.x + r.w, r.baseline + r.descent,
        ));

        const color = source.colors[i] || [1, 1, 1, 1];
        const verticesNum = rectVertices.length / vertexSize3d;
        colors.push(
            ...Array.from({length: verticesNum})
                .flatMap(() => color)
        );

        x += r.w / fontSizeMultiplier;
    }

    return {vertices, texPosition, colors};
}

export type Grid = {
    vertices: number[],
    texPosition: number[],
    colors: number[],
}
