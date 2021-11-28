export type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

const size = 4;
const sizeSq = size ** 2;

export function mul(A: Mat4, B: Mat4) {
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

function ix(r: number, c: number) {
    return r * size + c;
}

function asMat4(A: number[]): Mat4 {
    if (A.length === sizeSq) {
        return A as Mat4;
    }
    throw new Error(`Bad size=${A.length}`)
}

export function getScaleMat(scaleX: number, scaleY: number, scaleZ: number) {
    return asMat4([
        scaleX, 0, 0, 0,
        0, scaleY, 0, 0,
        0, 0, scaleZ, 0,
        0, 0, 0, 1,
    ]);
}

export function getRotateZMat(angleRad: number) {
    return asMat4([
        Math.cos(angleRad), -Math.sin(angleRad), 0, 0,
        Math.sin(angleRad), Math.cos(angleRad), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
}

export function getTranslateMat(x: number, y: number, z: number) {
    return asMat4([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
    ]);
}
