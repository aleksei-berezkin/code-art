import { create } from 'zustand'
import { ImgParams } from './model/ImgParams'

export const useStore = create<{
    openDialog: 'menu' | 'about' | undefined,
    imgParams: ImgParams | undefined,
    drawCounter: number,
    generateCounter: number,
    setOpenDialog: (openDialog: 'menu' | 'about' | undefined) => void,
    setImgParams: (imgParams: ImgParams | undefined) => void,

    // Only incrementing a counter triggers a draw
    incDrawCounter: () => void,
    incGenerateCounter: () => void,
}>(set => ({
    openDialog: undefined,
    imgParams: undefined,
    drawCounter: 0,
    generateCounter: 0,
    setOpenDialog: openDialog => set({openDialog}),
    setImgParams: imgParams => set({imgParams}),
    incDrawCounter: () => set(state => ({drawCounter: state.drawCounter + 1})),
    incGenerateCounter: () => set(state => ({generateCounter: state.generateCounter + 1}))
}))
