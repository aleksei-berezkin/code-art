export function rect(x1: number, y1: number, x2: number, y2: number) {
    return [x1, y1, x2, y1, x2, y2, x1, y1, x1, y2, x2, y2];
}

export function rect3dConstZ(x1: number, y1: number, x2: number, y2: number, z: number) {
    return [x1, y1, z,   x2, y1, z,   x2, y2, z,   x1, y1, z,   x2, y2, z,   x1, y2, z];
}

export const vertexSize3d = 3;
