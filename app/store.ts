import { create } from 'zustand'
import { ImgParams } from './model/ImgParams'

export const useStore = create<{
    openDialog: 'menu' | 'about' | undefined,
    imgParams: ImgParams | undefined,
    setOpenDialog: (openDialog: 'menu' | 'about' | undefined) => void,
    setImgParams: (imgParams: ImgParams | undefined) => void
}>(set => ({
    openDialog: undefined,
    imgParams: undefined,
    setOpenDialog: openDialog => set({openDialog}),
    setImgParams: imgParams => set({imgParams}),
}))
