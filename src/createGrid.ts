import {rect2d, rect3dConstZ, vertexSize3d } from './rect';
import type {RasterLetter} from "./rasterizeFont";
import {fontSizeMultiplier} from "./rasterizeFont";
import type {Source} from "./getSource";
import {pluck} from "./pluck";

export function createGrid(xMin: number, yMin: number,
                           xMax: number, yMax: number,
                           z: number,
                           scrollFraction: number,
                           source: Source, fontSize: number, lettersMap: Map<string, RasterLetter>,
): Grid {
    const vertices = [];
    const texPosition = [];
    const colors = [];

    const lRasters = [...lettersMap.values()];
    const maxAscent = lRasters.reduce((max, r) => r.ascent > max ? r.ascent : max, 0) / fontSizeMultiplier;

    const posMin = getPosMin(source, Math.ceil((yMax - yMin) / fontSize), scrollFraction);

    let x = xMin;
    let y = yMin;
    for (let i = posMin; i < source.text.length; i++) {
        let letter = source.text[i];
        if (letter === '\n') {
            x = xMin;
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

function getPosMin(source: Source, linesNum: number, scrollFraction: number) {
    if (source.linesOffsets.length <= linesNum) {
        return 0;
    }
    const fromLine = pluck(
        0,
        Math.round((source.linesOffsets.length - linesNum) * scrollFraction),
        source.linesOffsets.length - 1,
    );
    return source.linesOffsets[fromLine];
}
