export function rect2d(x1: number, y1: number, x2: number, y2: number) {
    return [x1, y1,      x2, y1,      x2, y2,      x1, y1,      x2, y2,      x1, y2];
}

export const rect2dVerticesNum = 6;
export const vertexSize2d = 2;
