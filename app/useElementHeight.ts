import { useEffect, useState } from 'react'

export function useElementHeight(isOpen: boolean, ref: React.RefObject<HTMLElement | null>, initial: string = '0') {
    const [height, setHeight] = useState(initial)

    useEffect(() => {
        if (isOpen) {
            setHeight(`${ref.current!.clientHeight}px`)
        } else {
            setHeight('0')
        }
    }, [isOpen])

    return height
}
