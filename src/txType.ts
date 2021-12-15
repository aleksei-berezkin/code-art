export type TxType = 'scale x' | 'scale y' | 'angle x' | 'angle y' | 'angle z' | 'translate x' | 'translate y' | 'translate z';
export const allTx: TxType[] = ['scale x', 'scale y', 'angle x', 'angle y', 'angle z', 'translate x', 'translate y', 'translate z'];
export const allTxWithoutScale = ['angle x', 'angle y', 'angle z', 'translate x', 'translate y', 'translate z'];

export type Transformations = {
    [type in TxType]: number
}
