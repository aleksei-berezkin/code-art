export type Unit = 'rad' | '%' | 'log10' | 'log10%'

export type SliderParam = {
    type: 'slider',
    min: number,
    val: number,
    max: number,
    unit?: Unit,
}

export type ChoicesParam = {
    type: 'choices',
    val: string,
    choices: string[],
}

export type ColorParam = {
    type: 'color',
    val: string,
}

export type CheckboxParam = {
    type: 'checkbox',
    val: boolean,
}

export type ImgParam = SliderParam | ChoicesParam | ColorParam | CheckboxParam

export type ImgParams = {
    angle: {
        x: SliderParam,
        y: SliderParam,
        z: SliderParam,
    },
    scroll: {
        v: SliderParam,
        h: SliderParam,
    },
    font: {
        face: ChoicesParam,
        size: SliderParam,
    },
    source: {
        source: ChoicesParam,
    },
    'main color': {
        scheme: ChoicesParam,
        brightness: SliderParam,
    },
    glow: {
        radius: SliderParam,
        brightness: SliderParam,
        recolor: SliderParam,
        to: ColorParam,
    },
    fade: {
        blur: SliderParam,
        fade: SliderParam,
        recolor: SliderParam,
        near: ColorParam,
        far: ColorParam,
    },
    attribution: {
        position: ChoicesParam,
        'code-art': CheckboxParam,
        'source': CheckboxParam,
    },
    'output image': {
        ratio: ChoicesParam,
        size: SliderParam,
    },
}

export type GroupName = keyof ImgParams

export type Group = {
    [key: string]: ImgParam
}

export function getSliderLabel(val: number, unit: Unit | undefined) {
    const s = unit === 'rad' ? `${roundTo2(val / Math.PI * 180)}\u00B0`
        : unit === '%' ? `${roundTo2(val)}%`
        : unit === 'log10' ? String(roundTo2(10 ** val))
        : unit === 'log10%' ? `${roundTo2(10 ** val)}%`
        : String(roundTo2(val))

    return s.replace(/-/, '\u2212')
}

function roundTo2(n: number) {
    return Math.round(n * 100) / 100
}

export function getSliderVal(sv: SliderParam) {
    const u = sv.unit
    const v = sv.val
    if (u === 'rad') {
        return v
    }
    if (u === '%') {
        return v / 100
    }
    if (u === 'log10') {
        return 10**v
    }
    if (u === 'log10%') {
        return 10**(v - 2)
    }
    return v
}
