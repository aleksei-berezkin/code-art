type Unit = 'rad' | '%' | 'log10' | 'log10%';

export type SliderVal = {
    type: 'slider',
    min: number,
    val: number,
    max: number,
    unit?: Unit,
}

type ChoicesVal = {
    type: 'choices',
    val: string,
    choices: string[],
}

type ColorVal = {
    type: 'color',
    val: string,
}

export type ImgParams = {
    angle: {
        x: SliderVal,
        y: SliderVal,
        z: SliderVal,
    },
    scroll: {
        v: SliderVal,
        h: SliderVal,
    },
    font: {
        face: ChoicesVal,
        size: SliderVal,
    },
    source: {
        source: ChoicesVal,
    },
    color: {
        scheme: ChoicesVal,
        brightness: SliderVal,
    },
    glow: {
        radius: SliderVal,
        brightness: SliderVal,
        recolor: SliderVal,
        to: ColorVal,
    },
    fade: {
        blur: SliderVal,
        fade: SliderVal,
        recolor: SliderVal,
        near: ColorVal,
        far: ColorVal,
    },
}

export type ParamGroup = keyof ImgParams;

export function getSliderLabel(sv: SliderVal, which: 'min' | 'val' | 'max') {
    const u = sv.unit;
    const v = sv[which];
    let s;
    if (u === 'rad') {
        s = `${roundTo2(v / Math.PI * 180)}\u00B0`;
    } else if (u === '%') {
        s = `${roundTo2(v)}%`;
    } else if (u === 'log10') {
        s = String(roundTo2(10 ** v));
    } else if (u === 'log10%') {
        s = `${roundTo2(10 ** v)}%`;
    } else {
        s = String(roundTo2(v));
    }
    return s.replace(/-/, '\u2212');
}

function roundTo2(n: number) {
    return Math.round(n * 100) / 100;
}

export function getSliderVal(sv: SliderVal) {
    const u = sv.unit;
    const v = sv.val;
    if (u === 'rad') {
        return v;
    }
    if (u === '%') {
        return v / 100;
    }
    if (u === 'log10') {
        return 10**v;
    }
    if (u === 'log10%') {
        return 10**(v - 2);
    }
    return v;
}
