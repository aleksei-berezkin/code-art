import { create } from 'zustand'
import { type ImgParam, type ImgParams } from './model/ImgParams'
import { produce } from 'immer'

export const useStore = create<{
    openDialog: 'menu' | 'about' | undefined,

    imgParams: ImgParams | undefined,

    openGroups: string[],

    generateCounter: number,
    drawCounter: number,

    currentCanvas: 0 | 1,
    progress: boolean,

    setOpenDialog: (openDialog: 'menu' | 'about' | undefined) => void,

    setImgParams: (imgParams: ImgParams | undefined) => void,
    updateImgParams: (recipe: (draft: ImgParams) => void) => void,
    updateImgParamsAndIncDrawCounter: (recipe: (draft: ImgParams) => void) => void,

    toggleGroup: (groupName: string) => void,

    setCurrentCanvas: (currentCanvas: 0 | 1) => void,
    setProgress: (progress: boolean) => void,

    // Only incrementing a counter triggers a draw
    incGenerateCounter: () => void,
    incDrawCounter: () => void,
}>(set => ({
    openDialog: undefined,

    imgParams: undefined,

    openGroups: [],

    generateCounter: 0,
    drawCounter: 0,
    currentCanvas: 0,
    progress: false,

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

    toggleGroup: groupName => set(({openGroups}) => ({
        openGroups: openGroups.includes(groupName)
            ? openGroups.filter(g => g !== groupName)
            : [...openGroups, groupName],
    })),

    setCurrentCanvas: currentCanvas => set({currentCanvas}),
    setProgress: progress => set({progress}),

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
