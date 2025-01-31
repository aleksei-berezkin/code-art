import './useLayerState.css'

import { useEffect, useRef, useState } from 'react'
import { parseMs } from './util/parseMs'

export function useLayerState(isOpen: boolean) {
    const [layerState, setLayerState] = useState<'layer-hidden' | 'layer-fade-in' | 'layer-open' | 'layer-fade-out'>('layer-hidden')

    const mount = useRef(true)

    useEffect(() => {
        if (isOpen) {
            mount.current = false
            setLayerState('layer-fade-in')
            let rafId = requestAnimationFrame(() => 
                rafId = requestAnimationFrame(() => setLayerState('layer-open'))
            )
            return () => cancelAnimationFrame(rafId)
        } else if (!isOpen && !mount.current) {
            const tx = parseMs(window.getComputedStyle(document.body).getPropertyValue('--layer-tx'))
            setLayerState('layer-fade-out')
            const timerId = setTimeout(() => setLayerState('layer-hidden'), tx)
            return () => clearTimeout(timerId)
        }
    }, [isOpen])

    return layerState
}