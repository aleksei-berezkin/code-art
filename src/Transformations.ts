export type Transformations = {
    [t in TxType]: {
        min: number,
        val: number,
        max: number,
    }
}

export type TxType =
    'angle x'
    | 'angle y'
    | 'angle z'
    | 'translate x'
    | 'translate y'
    | 'translate z'
    | 'scroll';
