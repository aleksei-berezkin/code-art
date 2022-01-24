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
    position: {
        scroll: SliderVal,
        x: SliderVal,
        y: SliderVal,
        z: SliderVal,
    },
    font: {
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
