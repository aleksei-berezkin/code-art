export type ImgParams = {
    [k in ParamSliderKey]: {
        type: 'slider',
        min: number,
        val: number,
        max: number,
    }
} & {
    [k in ParamChoiceKey]: {
        type: 'choices',
        val: string,
        choices: string[],
    }
} & {
    [k in ParamColorKey]: {
        type: 'color',
        val: string,
    }
}

export type ParamSliderKey =
    'angle x'
    | 'angle y'
    | 'angle z'
    | 'translate x'
    | 'translate y'
    | 'translate z'
    | 'scroll'
    | 'font size'
    | 'blur'
    | 'glow radius'
    | 'color amplification'
    | 'glow color amplification'
    ;

export type ParamChoiceKey =
    'color scheme'
    | 'source'
    ;

export type ParamColorKey =
    'glow color addition'
    | 'fade in distortion'
    | 'fade out distortion'
    ;

export type ParamKey = ParamSliderKey;
