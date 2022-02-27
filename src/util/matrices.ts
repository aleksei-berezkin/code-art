/**
 * All matrices are in "math" notation where row is row, column is column, or, in other words,
 * matrix' slice is a row. When passed as uniforms matrices get transposed.
 */

export type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

const size = 4;

export function mul(...A: Mat4[]): Mat4 {
    return A.reduce(mul2);
}

function mul2(A: Mat4, B: Mat4): Mat4 {
    const C = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            let s = 0;
            for (let i = 0; i < size; i++) {
                s += A[ix(r, i)] * B[ix(i, c)];
            }
            C.push(s);
        }
    }
    return asMat4(C);
}

/**
 * Unlike math, vector here is 'horizontal'
 */
export type Vec4 = [
    number, number, number, number
];

export function mulVec(A: Mat4, v: Vec4): Vec4 {
    return [
        A[ix(0, 0)] * v[0] + A[ix(0, 1)] * v[1] + A[ix(0, 2)] * v[2] + A[ix(0, 3)] * v[3],
        A[ix(1, 0)] * v[0] + A[ix(1, 1)] * v[1] + A[ix(1, 2)] * v[2] + A[ix(1, 3)] * v[3],
        A[ix(2, 0)] * v[0] + A[ix(2, 1)] * v[1] + A[ix(2, 2)] * v[2] + A[ix(2, 3)] * v[3],
        A[ix(3, 0)] * v[0] + A[ix(3, 1)] * v[1] + A[ix(3, 2)] * v[2] + A[ix(3, 3)] * v[3],
    ] as Vec4;
}

function ix(r: number, c: number) {
    return r * size + c;
}

const sizeSq = size ** 2;

export function asMat4(A: number[]): Mat4 {
    if (A.length === sizeSq) {
        return A as Mat4;
    }
    throw new Error(`Bad size=${A.length}`)
}

export function getRotateZMat(angleRad: number) {
    return asMat4([
        Math.cos(angleRad),  Math.sin(angleRad), 0, 0,
        -Math.sin(angleRad), Math.cos(angleRad), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
}

export function getRotateXMat(angleRad: number) {
    return asMat4([
        1, 0, 0, 0,
        0, Math.cos(angleRad),  Math.sin(angleRad), 0,
        0, -Math.sin(angleRad), Math.cos(angleRad), 0,
        0, 0, 0, 1,
    ]);
}

export function getRotateYMat(angleRad: number) {
    return asMat4([
        Math.cos(angleRad), 0, Math.sin(angleRad), 0,
        0, 1, 0, 0,
        -Math.sin(angleRad), 0, Math.cos(angleRad), 0,
        0, 0, 0, 1,
    ]);
}

// noinspection JSUnusedGlobalSymbols
export function getTranslateMat(x: number, y: number, z: number) {
    return asMat4([
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1,
    ]);
}
