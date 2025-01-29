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
import { setTaskExecutorListeners, submitTask } from './util/submitTask';
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
    const codeCanvasRef = useRef<HTMLCanvasElement>(null)

    useDrawing(alphabetCanvasRef, attributionCanvasRef, selfAttrCanvasRef, codeCanvasRef)

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
        <CodeCanvas codeCanvasRef={codeCanvasRef}/>

        <ImgParamsMenuButton/>
        <ImgParamsMenu/>
        <GenerateButton/>
        <DownloadButton codeCanvasRef={codeCanvasRef}/>

        <Progress/>

        <About/>
    </main>
}

function CodeCanvas({codeCanvasRef}: {codeCanvasRef: RefObject<HTMLCanvasElement | null>}) {
    const ratio = useStore(state => state.imgParams ? state.imgParams['output image'].ratio.val : undefined)
    const sizeFr = useStore(state => state.imgParams ? getSliderVal(state.imgParams['output image'].size) : undefined)

    const fitOrAspectClass = !ratio || ratio === fitViewRatio ? 'fit' : 'aspect'

    return <canvas
                className={`code-canvas ${fitOrAspectClass}`}
                style={{
                    '--s': sizeFr && String(sizeFr),
                    '--a': ratio && ratio !== fitViewRatio && `calc(${getFractionFromDisplayedRatio(ratio)})`,
                } as any}
                ref={codeCanvasRef} />
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

function Progress() {
    const [progress, setProgress] = useState(false)

    useEffect(() => {
        setTaskExecutorListeners({
            onStart: () => setProgress(true),
            onEnd: () => setProgress(false),
        })
    }, [])

    if (!progress) return undefined

    return (
        <svg className='progress-svg' viewBox='-26 -26 52 52'>
            <circle className='progress-circle' fill='none' cx='0' cy='0' r='20' strokeWidth='4'/>
        </svg>
    )
}

function useDrawing(
    alphabetCanvasRef: RefObject<HTMLCanvasElement | null>,
    attributionCanvasRef: RefObject<HTMLCanvasElement | null>,
    selfAttrCanvasRef: RefObject<HTMLCanvasElement | null>,
    codeCanvasRef: RefObject<HTMLCanvasElement | null>,
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
            await updateCodeCanvasSize()
            await drawRandomScene(
                useStore.getState().imgParams,
                codeCanvasRef.current!,
                alphabetCanvasRef.current!,
                attributionCanvasRef.current!,
                selfAttrCanvasRef.current!,
                useStore.getState().setImgParams,
            )
        })
    }

    function submitDrawScene() {
        submitTask(async () => {
            const canvasSizeChanged = await updateCodeCanvasSize()
            if (canvasSizeChanged) {
                const newFontSize = calcOptimalFontSize(getPixelSpaceSize(codeCanvasRef.current!))
                useStore.getState().updateImgParams(draft => {
                    draft.font.size.val = newFontSize
                })
            }

            await drawScene(
                useStore.getState().imgParams!,
                codeCanvasRef.current!,
                alphabetCanvasRef.current!,
                attributionCanvasRef.current!,
                selfAttrCanvasRef.current!,
            )
        })
    }

    async function updateCodeCanvasSize() {
        // Make sure layout happened
        // In Safari sizes may be not ready on mount, raf helps
        await delayToAnimationFrame()

        const prevWidth = codeCanvasRef.current!.width
        const prevHeight = codeCanvasRef.current!.height

        const canvasRect = codeCanvasRef.current!.getBoundingClientRect()

        const newWidth = canvasRect.width * dpr()
        const newHeight = canvasRect.height * dpr()

        if (prevWidth !== newWidth || prevHeight !== newHeight) {
            codeCanvasRef.current!.width = newWidth
            codeCanvasRef.current!.height = newHeight
            return true
        }

        return false
    }
}
