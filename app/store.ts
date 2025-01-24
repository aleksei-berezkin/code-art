import { create } from 'zustand'
import { ImgParams } from './model/ImgParams'

export const useStore = create<{
    openDialog: 'menu' | 'about' | undefined,
    imgParams: ImgParams | undefined,
    generateCounter: number,
    drawCounter: number,
    setOpenDialog: (openDialog: 'menu' | 'about' | undefined) => void,
    setImgParams: (imgParams: ImgParams | undefined) => void,

    // Only incrementing a counter triggers a draw
    incGenerateCounter: () => void,
    incDrawCounter: () => void,
}>(set => ({
    openDialog: undefined,
    imgParams: undefined,
    generateCounter: 0,
    drawCounter: 0,
    setOpenDialog: openDialog => set({openDialog}),
    setImgParams: imgParams => set({imgParams}),
    incGenerateCounter: () => set(state => ({generateCounter: state.generateCounter + 1})),
    incDrawCounter: () => set(state => ({drawCounter: state.drawCounter + 1})),
}))
