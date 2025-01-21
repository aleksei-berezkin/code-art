import { degToRad } from '../util/degToRad';

export function generateAngles(isMin: boolean): {x: number, y: number, z: number} {
    const x = randomSign() * randomAngleDeg(3, isMin ? 15 : 12);
    const y = (isMin ? randomSign() : -1) * randomAngleDeg(4, isMin ? 18 : 16);
    const z = isMin ? randomSign() * randomAngleDeg(1.5, 3.5) : 0;

    return {
        x: degToRad(x),
        y: degToRad(y),
        z: degToRad(z),
    };
}

function randomAngleDeg(degMin: number, degMax: number) {
    return degMin + Math.random() * (degMax - degMin);
}

function randomSign() {
    return Math.random() < .5 ? -1 : 1;
}
