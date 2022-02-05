import { degToRad } from '../util/degToRad';

export function generateAngles(isMin: boolean): {x: number, y: number, z: number} {
    const x = randomSign() * randomAngle(3, isMin ? 13 : 11);
    const y = (isMin ? randomSign() : -1) * randomAngle(4, isMin ? 15 : 13);

    const xAbs = Math.abs(x);
    const yAbs = Math.abs(y);
    if (isMin && xAbs > 10.5 && yAbs > 12.5 || !isMin && xAbs > 7 && yAbs > 10) {
        return generateAngles(isMin);
    }

    const z = isMin ? randomSign() * randomAngle(1.5, 3.5) : 0;
    return {x, y, z};
}

function randomAngle(degMin: number, degMax: number) {
    return degToRad(degMin) + Math.random() * degToRad(degMax - degMin);
}

function randomSign() {
    return Math.random() < .5 ? -1 : 1;
}
