export function setRect2d(a: Float32Array, i: number, x1: number, y1: number, x2: number, y2: number) {
    a[i] = x1;
    a[i + 1] = y1;

    a[i + 2] = x2;
    a[i + 3] = y1;

    a[i + 4] = x2;
    a[i + 5] = y2;

    a[i + 6] = x1;
    a[i + 7] = y1;

    a[i + 8] = x2;
    a[i + 9] = y2;

    a[i + 10] = x1;
    a[i + 11] = y2;
}

export const rect2dVerticesNum = 6;
export const rect2dVertexSize = 2;
export const rect2dSize = rect2dVerticesNum * rect2dVertexSize;
