import { useEffect, useRef, useState } from 'react'
import type { Css } from 'typique'

export function useLayerStateClass(isOpen: boolean) {
    const tx = 250
    type TX = `${typeof tx}ms`

    const layerFadeInClass = 'layer-fade-in' satisfies Css<{
        opacity: 0
        scale: '.97'
    }>
    const layerOpenClass = 'layer-open' satisfies Css<{
        opacity: '1'
        scale: '1'
        transition: `opacity ${TX}, scale ${TX}`
    }>
    const layerFadeOutClass = 'layer-fade-out' satisfies Css<{
        opacity: 0
        filter: 'blur(6px)'
        scale: '1.03'
        transition: `filter ${TX}, opacity ${TX}, scale ${TX}`
    }>

    const [layerState, setLayerState] = useState<undefined | typeof layerFadeInClass | typeof layerOpenClass | typeof layerFadeOutClass>(undefined)

    const firstOpen = useRef(true)

    useEffect(() => {
        if (isOpen) {
            firstOpen.current = false
            setLayerState(layerFadeInClass)
            let rafId = requestAnimationFrame(() =>
                rafId = requestAnimationFrame(() => setLayerState(layerOpenClass))
            )
            return () => cancelAnimationFrame(rafId)
        } else if (!isOpen && !firstOpen.current) {
            setLayerState(layerFadeOutClass)
            const timerId = setTimeout(() => setLayerState(undefined), tx)
            return () => clearTimeout(timerId)
        }
    }, [isOpen, layerFadeInClass, layerFadeOutClass, layerOpenClass])

    return layerState
}
