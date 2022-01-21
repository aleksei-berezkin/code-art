// export type ImgParams = {
//     [k in ParamSliderKey]: {
//         group: ParamGroup,
//         type: 'slider',
//         min: number,
//         val: number,
//         max: number,
//     }
// } & {
//     [k in ParamChoiceKey]: {
//         group: ParamGroup,
//         type: 'choices',
//         val: string,
//         choices: string[],
//     }
// } & {
//     [k in ParamColorKey]: {
//         group: ParamGroup,
//         type: 'color',
//         val: string,
//     }
// }

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

// export type ParamGroup = 'angle' | 'position' | 'font' | 'source' | 'color' | 'glow' | 'fade';

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

// export type ParamSliderKey =
//     'angle x'
//     | 'angle y'
//     | 'angle z'
//     | 'translate x'
//     | 'translate y'
//     | 'translate z'
//     | 'scroll'
//     | 'font size'
//     | 'blur'
//     | 'glow radius'
//     | 'color amplification'
//     | 'glow amplification'
//     | 'glow color shift'
//     | 'fade'
//     | 'fade distortion'
//     ;
//
// export type ParamChoiceKey =
//     'color scheme'
//     | 'source'
//     ;
//
// export type ParamColorKey =
//     'glow shifted color'
//     | 'fade in distortion'
//     | 'fade out distortion'
//     ;
//
//
// export const paramGroups: ParamGroup[] = ['angle' as const, 'position' as const, 'font' as const,
//     'source' as const, 'color' as const, 'glow' as const, 'fade' as const];
