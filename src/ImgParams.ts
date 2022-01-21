type SliderVal = {
    type: 'slider',
    min: number,
    val: number,
    max: number,
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
        'angle x': SliderVal,
        'angle y': SliderVal,
        'angle z': SliderVal,
    },
    position: {
        scroll: SliderVal,
        'translate x': SliderVal,
        'translate y': SliderVal,
        'translate z': SliderVal,
    },
    font: {
        'font size': SliderVal,
    },
    source: {
        source: ChoicesVal,
    },
    color: {
        'color scheme': ChoicesVal,
        'color amplification': SliderVal,
    },
    glow: {
        'glow radius': SliderVal,
        'glow amplification': SliderVal,
        'glow shifted color': ColorVal,
        'glow color shift': SliderVal,
    },
    fade: {
        blur: SliderVal,
        fade: SliderVal,
        'fade distortion': SliderVal,
        'fade in distortion': ColorVal,
        'fade out distortion': ColorVal,
    },
}

export type ParamGroup = keyof ImgParams;
