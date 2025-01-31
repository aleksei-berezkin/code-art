'use client'

import './Main.css'

import { About } from './About';
import { delay, delayToAnimationFrame } from './util/delay';
import { dpr } from './util/dpr';
import { drawRandomScene, drawScene } from './draw/drawScene';
import { fitViewRatio, getFractionFromDisplayedRatio } from './model/ratios';
import { getSliderVal } from './model/ImgParams';
import { ImgParamsMenu } from './ImgParamsMenu';
import { Icon } from './Icon';
import { submitTask } from './util/submitTask';
import { type MouseEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { useStore } from './store';
import { calcOptimalFontSize } from './draw/calcOptimalFontSize';
import { getPixelSpaceSize } from './draw/getPixelSpaceSize';

export function Main() {
    const mainRef = useRef<HTMLElement>(null);
    useEffect(() => {
        function setMainSizeVars() {
            const rect = mainRef.current!.getBoundingClientRect()
            mainRef.current!.style.setProperty('--main-h', `${rect.height}px`)
            mainRef.current!.style.setProperty('--main-w', `${rect.width}px`)
        }
        setMainSizeVars()

        window.addEventListener('resize', setMainSizeVars)
        return () => window.removeEventListener('resize', setMainSizeVars)
    }, [])


    const alphabetCanvasRef = useRef<HTMLCanvasElement>(null)
    const attributionCanvasRef = useRef<HTMLCanvasElement>(null)
    const selfAttrCanvasRef = useRef<HTMLCanvasElement>(null)
    const codeCanvas0Ref = useRef<HTMLCanvasElement>(null)
    const codeCanvas1Ref = useRef<HTMLCanvasElement>(null)

    useDrawing(alphabetCanvasRef, attributionCanvasRef, selfAttrCanvasRef, codeCanvas0Ref, codeCanvas1Ref)

    const setOpenDialog = useStore(state => state.setOpenDialog)
    function handleRootClick(e: MouseEvent) {
        let current = e.target as HTMLElement | null
        while (current) {
            if (current.classList.contains('dialog-layer')) return
            current = current.parentElement
        }
        setOpenDialog(undefined)
    }

    return <main className='main' ref={mainRef} onClick={handleRootClick}>
        <canvas className='alphabet-canvas' ref={alphabetCanvasRef} width='2048' />
        <canvas className='attribution-canvas' ref={attributionCanvasRef}/>
        <canvas className='self-attr-canvas' ref={selfAttrCanvasRef} />

        <CodeCanvas index={0} codeCanvasRef={codeCanvas0Ref}/>
        <CodeCanvas index={1} codeCanvasRef={codeCanvas1Ref}/>

        <Progress/>

        <ImgParamsMenuButton/>
        <ImgParamsMenu/>
        <GenerateButton/>
        <DownloadButton codeCanvasRef={codeCanvas1Ref}/>

        <About/>
    </main>
}

function CodeCanvas({index, codeCanvasRef}: {index: 0 | 1, codeCanvasRef: RefObject<HTMLCanvasElement | null>}) {
    const ratio = useStore(state => state.imgParams ? state.imgParams['output image'].ratio.val : undefined)
    const sizeFr = useStore(state => state.imgParams ? getSliderVal(state.imgParams['output image'].size) : undefined)
    const opaque = useStore(state => !!state.imgParams && (!index || state.currentCanvas))

    const fitOrAspectClass = !ratio || ratio === fitViewRatio ? 'fit' : 'aspect'

    return <canvas
                className={`code-canvas ${fitOrAspectClass}`}
                style={{
                    '--s': sizeFr && String(sizeFr),
                    '--a': ratio && ratio !== fitViewRatio && `calc(${getFractionFromDisplayedRatio(ratio)})`,
                    'opacity': opaque ? 1 : 0,
                } as any}
                ref={codeCanvasRef} />
}

function Progress() {
    const opaque = useStore(state => state.progress)
    const [running, setRunning] = useState(false)

    useEffect(() => {
        if (opaque && !running) {
            setRunning(true)
        } else if (!opaque && running) {
            const timerId = setTimeout(() => {
                setRunning(false)
            }, 500)
            return () => clearTimeout(timerId)
        }
    }, [opaque, running])

    return (
        <svg className='progress-svg' viewBox='-26 -26 52 52' style={{opacity: opaque ? 1 : 0}}>
            <circle className='progress-circle' fill='none' cx='0' cy='0' r='20' strokeWidth='4' style={{animationPlayState: running ? 'running' : 'paused'}}/>
        </svg>
    )
}

function ImgParamsMenuButton() {
    const isOpen = useStore(state => state.openDialog === 'menu')
    const setOpenDialog = useStore(state => state.setOpenDialog)

    function handleClick() {
        setOpenDialog(isOpen ? undefined : 'menu')
    }

    return (
        <button className='round-btn left dialog-layer' onClick={ handleClick } style={{transform: useButtonScaleTransform()}}>
            <div className={`menu-btn-wrapper ${isOpen ? 'hidden' : ''}`}>
                <Icon pic='menu'/>
            </div>
            <div className={`menu-btn-wrapper ${isOpen ? '' : 'hidden'}`}>
                <Icon pic='close'/>
            </div>
        </button>
    )
}


function GenerateButton() {
    const generateCounter = useStore(state => state.generateCounter)
    const incGenerateCounter = useStore(state => state.incGenerateCounter)
    return (
        <button className='round-btn second-to-right' onClick={incGenerateCounter} style={{transform: useButtonScaleTransform()}}>
            <div className='generate-icon-wrapper' style={{transform: `rotate(${Math.max(1 /* Skip 1st generation */, generateCounter) * 360}deg)`}}>
                <Icon pic='reload' />
            </div>
        </button>
    )
}

function DownloadButton({codeCanvasRef}: {codeCanvasRef: RefObject<HTMLCanvasElement | null>}) {
    function handleDownloadClick() {
        codeCanvasRef.current!.toBlob(blob => {
            const a = document.createElement('a')
            const objUrl = URL.createObjectURL(blob!)
            a.href = objUrl
            a.download = 'CodeArt.png'
            a.click();
            setTimeout(() => URL.revokeObjectURL(objUrl), 10_000)
        })
        runAnimation()
    }

    const [sliding, setSliding] = useState(false)
    const animationDuration = 300

    async function runAnimation() {
        if (sliding) return

        setSliding(true)
        await delay(animationDuration)
        setSliding(false)
    }

    return (
        <button className='round-btn right' onClick={handleDownloadClick} style={{transform: useButtonScaleTransform()}}>
            <div className='download-slider' style={{
                top: sliding ? 0 : '-100%',
                transition: sliding ? `top ${animationDuration}ms` : undefined,
            }}>
                <Icon pic='download'/>
                <Icon pic='download'/>
            </div>
        </button>
    )
}

const useButtonScaleTransform = () => useStore(state => `scale(${state.imgParams ? 1 : 0})`)

function useDrawing(
    alphabetCanvasRef: RefObject<HTMLCanvasElement | null>,
    attributionCanvasRef: RefObject<HTMLCanvasElement | null>,
    selfAttrCanvasRef: RefObject<HTMLCanvasElement | null>,
    codeCanvas0Ref: RefObject<HTMLCanvasElement | null>,
    codeCanvas1Ref: RefObject<HTMLCanvasElement | null>,
) {
    const incGenerateCounter = useStore(state => state.incGenerateCounter)
    const incDrawCounter = useStore(state => state.incDrawCounter)

    useEffect(() => {
        incGenerateCounter()

        window.addEventListener('resize',  incDrawCounter)
        return () => window.removeEventListener('resize', incDrawCounter)
    }, [])

    const generateCounter = useStore(state => state.generateCounter)
    const drawCounter = useStore(state => state.drawCounter)

    const prevGenerateCounter = useRef(generateCounter)
    const prevDrawCounter = useRef(drawCounter)

    useEffect(() => {
        if (generateCounter !== prevGenerateCounter.current) {
            submitDrawRandomScene()
        } else if (drawCounter !== prevDrawCounter.current) {
            submitDrawScene()
        }

        prevGenerateCounter.current = generateCounter
        prevDrawCounter.current = drawCounter
    }, [generateCounter, drawCounter])

    function submitDrawRandomScene() {
        submitTask(async () => {
            const [nextIndex, nextCanvas] = getNextCanvas()

            await updateCodeCanvasSize(nextCanvas)

            await drawRandomScene(
                useStore.getState().imgParams,
                nextCanvas,
                alphabetCanvasRef.current!,
                attributionCanvasRef.current!,
                selfAttrCanvasRef.current!,
                useStore.getState().setImgParams,
            )

            useStore.getState().setCurrentCanvas(nextIndex)
        })
    }

    function submitDrawScene() {
        submitTask(async () => {
            if (!useStore.getState().imgParams) return

            const [nextIndex, nextCanvas] = getNextCanvas()

            const canvasSizeChanged = await updateCodeCanvasSize(nextCanvas)
            if (canvasSizeChanged) {
                const newFontSize = calcOptimalFontSize(getPixelSpaceSize(nextCanvas))
                useStore.getState().updateImgParams(draft => {
                    draft.font.size.val = newFontSize
                })
            }

            await drawScene(
                useStore.getState().imgParams!,
                nextCanvas,
                alphabetCanvasRef.current!,
                attributionCanvasRef.current!,
                selfAttrCanvasRef.current!,
            )

            useStore.getState().setCurrentCanvas(nextIndex)
        })
    }

    function getNextCanvas(): [0 | 1, HTMLCanvasElement] {
        const index = useStore.getState().currentCanvas ? 0 : 1
        const canvas = (index ? codeCanvas1Ref : codeCanvas0Ref).current!
        return [index, canvas]
    }

    async function updateCodeCanvasSize(codeCanvas: HTMLCanvasElement) {
        // Make sure layout happened
        // In Safari sizes may be not ready on mount, raf helps
        await delayToAnimationFrame()

        const prevWidth = codeCanvas.width
        const prevHeight = codeCanvas.height

        const canvasRect = codeCanvas.getBoundingClientRect()

        const newWidth = canvasRect.width * dpr()
        const newHeight = canvasRect.height * dpr()

        if (prevWidth !== newWidth || prevHeight !== newHeight) {
            codeCanvas.width = newWidth
            codeCanvas.height = newHeight
            return true
        }

        return false
    }
}
