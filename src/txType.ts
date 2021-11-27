export type TxType = 'scale x' | 'scale y' | 'angle' | 'translate x' | 'translate y';
export const allTx: TxType[] = ['scale x', 'scale y', 'angle', 'translate x', 'translate y'];
export type Transformations = {
    [type in TxType]: number
}
