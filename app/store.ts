import { create } from 'zustand'
import { type ImgParam, type ImgParams } from './model/ImgParams'
import { produce } from 'immer'

export const useStore = create<{
    openDialog: 'menu' | 'about' | undefined,
    imgParams: ImgParams | undefined,
    generateCounter: number,
    drawCounter: number,
    currentCanvas: 0 | 1,

    setOpenDialog: (openDialog: 'menu' | 'about' | undefined) => void,
    setImgParams: (imgParams: ImgParams | undefined) => void,
    updateImgParams: (recipe: (draft: ImgParams) => void) => void,
    updateImgParamsAndIncDrawCounter: (recipe: (draft: ImgParams) => void) => void,

    setCurrentCanvas: (currentCanvas: 0 | 1) => void,

    // Only incrementing a counter triggers a draw
    incGenerateCounter: () => void,
    incDrawCounter: () => void,
}>(set => ({
    openDialog: undefined,
    imgParams: undefined,
    generateCounter: 0,
    drawCounter: 0,
    currentCanvas: 0,

    setOpenDialog: openDialog => set({openDialog}),
    setImgParams: imgParams => set({imgParams}),
    updateImgParams: (recipe: (draft: ImgParams) => void) => set(state =>
        ({imgParams: produce(state.imgParams!, recipe)})
    ),
    updateImgParamsAndIncDrawCounter: (recipe: (draft: ImgParams) => void) => set(state =>
        ({
            imgParams: produce(state.imgParams!, draft => {
                recipe(draft)
            }),
            drawCounter: state.drawCounter + 1,
        })
    ),

    setCurrentCanvas: currentCanvas => set({currentCanvas}),

    incGenerateCounter: () => set(state => ({generateCounter: state.generateCounter + 1})),
    incDrawCounter: () => set(state => ({drawCounter: state.drawCounter + 1})),
}))

export type ImgParamsSimple = {
    [groupName: string]: {
        [paramName: string]: ImgParam
    }
}

export type ImgParamsSimpleSlice = {
    imgParams: ImgParamsSimple | undefined
}
