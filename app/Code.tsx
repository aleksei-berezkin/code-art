'use client'

import './Code.css'

import { About } from './About';
import { delayToAnimationFrame } from './util/delay';
import { dpr } from './util/dpr';
import { drawRandomScene, drawScene } from './draw/drawScene';
import { fitViewRatio, getFractionFromDisplayedRatio } from './model/ratios';
import { getSliderVal } from './model/ImgParams';
import { ImgParamsMenu } from './ImgParamsMenu';
import { Icon } from './Icon';
import { setTaskExecutorListeners, submitTask } from './util/submitTask';
import { MouseEvent, RefObject, useEffect, useRef, useState } from 'react';
import { useStore } from './store';
import { calcOptimalFontSize } from './draw/calcOptimalFontSize';
import { getPixelSpaceSize } from './draw/getPixelSpaceSize';

export function Code() {
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

    const setOpenDialog = useStore(state => state.setOpenDialog)

    function handleRootClick(e: MouseEvent) {
        let current = e.target as Element | null
        while (current) {
            if (current.classList.contains('dialog-layer')) return
            current = current.parentElement
        }
        setOpenDialog(undefined)
    }

    const fitOrAspectClass = useStore(state => !state.imgParams || state.imgParams['output image'].ratio.val === fitViewRatio ? 'fit' : 'aspect')


    return <main ref={mainRef} onClick={handleRootClick}>
        <canvas className='alphabet-canvas' ref={alphabetCanvasRef} width='2048' />
        <canvas className='attribution-canvas' ref={attributionCanvasRef}/>
        <canvas className='self-attr-canvas' ref={selfAttrCanvasRef} />
        <canvas className={`code-canvas ${fitOrAspectClass}`} ref={codeCanvasRef} />

        <ImgParamsMenuButton/>
        <ImgParamsMenu/>
        <GenerateButton/>
        <DownloadButton codeCanvasRef={codeCanvasRef}/>
        <Progress/>
        <About/>
        <DrawingComponent
            alphabetCanvasRef={alphabetCanvasRef}
            attributionCanvasRef={attributionCanvasRef}
            selfAttrCanvasRef={selfAttrCanvasRef}
            codeCanvasRef={codeCanvasRef}
        />
    </main>
}

function ImgParamsMenuButton() {
    const openDialog = useStore(state => state.openDialog)
    const setOpenDialog = useStore(state => state.setOpenDialog)

    function handleImgParamsButtonClick(e: MouseEvent) {
        setOpenDialog(openDialog === 'menu' ? undefined : 'menu')
        e.stopPropagation()
    }

    return <button className='round-btn left' onClick={handleImgParamsButtonClick}>
        <Icon pic={(openDialog === 'menu') ? 'close' : 'menu'}/>
    </button>
}

function GenerateButton() {
    const generateCounter = useStore(state => state.generateCounter)
    const incGenerateCounter = useStore(state => state.incGenerateCounter)

    const imgParams = useStore(state => state.imgParams)

    async function handleGenerateClick() {
        if (imgParams) {
            incGenerateCounter()
        }
    }

    return <button className='round-btn second-to-right' onClick={handleGenerateClick}>
        <Icon pic='reload' rotateDeg={generateCounter * 360}/>
    </button>
}

function DownloadButton({codeCanvasRef}: {codeCanvasRef: RefObject<HTMLCanvasElement | null>}) {
    const [downloading, setDownloading] = useState(false)
    function handleDownloadClick() {
        if (!downloading) {
            setDownloading(true)
            codeCanvasRef.current!.toBlob(blob => {
                const a = document.createElement('a')
                const objUrl = URL.createObjectURL(blob!)
                a.href = objUrl
                a.download = 'CodeArt.png'
                a.click();
                setTimeout(
                    () => setDownloading(false),
                    1200,
                )
                setTimeout(() => URL.revokeObjectURL(objUrl), 5000)
            });
        }
    }

    return <button className='round-btn right' onClick={handleDownloadClick}>
        <Icon pic={downloading ? 'pending' : 'download'}/>
    </button>
}

function DrawingComponent({
    alphabetCanvasRef,
    attributionCanvasRef,
    selfAttrCanvasRef,
    codeCanvasRef
}: {
    alphabetCanvasRef: RefObject<HTMLCanvasElement | null>,
    attributionCanvasRef: RefObject<HTMLCanvasElement | null>,
    selfAttrCanvasRef: RefObject<HTMLCanvasElement | null>,
    codeCanvasRef: RefObject<HTMLCanvasElement | null>,
}) {
    const imgParams = useStore(state => state.imgParams)
    const setImgParams = useStore(state => state.setImgParams)

    const drawCounter = useStore(state => state.drawCounter)
    const generateCounter = useStore(state => state.generateCounter)

    const prevDrawCounter = useRef(drawCounter)
    const prevGenerateCounter = useRef(generateCounter)

    useEffect(() => {
        if (!imgParams) {
            // Initial render
            (async () => {
                await setCodeCanvasWH()
                await generateScene(true)
            })()
        } else if (drawCounter !== prevDrawCounter.current) {
            drawSceneWithParams()
        } else if (generateCounter !== prevGenerateCounter.current) {
            generateScene()
        }

        prevDrawCounter.current = drawCounter
        prevGenerateCounter.current = generateCounter
    }, [imgParams, drawCounter, generateCounter])

    async function setCodeCanvasWH() {
        // Make sure layout happened
        // In Safari sizes may be not ready on mount, raf helps
        await delayToAnimationFrame()
        const canvasRect = codeCanvasRef.current!.getBoundingClientRect()
        codeCanvasRef.current!.width = canvasRect.width * dpr()
        codeCanvasRef.current!.height = canvasRect.height * dpr()
    }

    async function generateScene(initial?: boolean) {
        submitTask(async () =>
            await drawRandomScene(
                imgParams,
                codeCanvasRef.current!,
                alphabetCanvasRef.current!,
                attributionCanvasRef.current!,
                selfAttrCanvasRef.current!,
                setImgParams,
            ),
            initial,
        )
    }

    async function drawSceneWithParams() {
        submitTask(async () => {
            updateCodeCanvasStyle();
            await setCodeCanvasWH();
            await drawScene(
                imgParams!,
                codeCanvasRef.current!,
                alphabetCanvasRef.current!,
                attributionCanvasRef.current!,
                selfAttrCanvasRef.current!,
            );
        });
    }

    const incDrawCounter = useStore(state => state.incDrawCounter)

    useEffect(() => {
        function resizeListener() {
            if (imgParams) {
                // TODO also resize on output image size change
                imgParams.font.size.val = calcOptimalFontSize(getPixelSpaceSize(codeCanvasRef.current!))
                setImgParams({...imgParams})
                incDrawCounter()
            }
        }

        window.addEventListener('resize', resizeListener)
        return () => window.removeEventListener('resize', resizeListener)
    }, [imgParams])

    async function updateCodeCanvasStyle() {
        if (imgParams) {
            const r = imgParams['output image'].ratio.val;

            const sizeFr = getSliderVal(imgParams['output image'].size);
            codeCanvasRef.current!.style.setProperty('--s', String(sizeFr));

            if (r !== fitViewRatio) {
                codeCanvasRef.current!.style.setProperty('--a', `calc(${getFractionFromDisplayedRatio(r)})`);
            }
        }
    }

    return <></>
}

function Progress() {
    const [progress, setProgress] = useState(false)
    useEffect(() => {
        setTaskExecutorListeners({
            onStart: () => setProgress(true),
            onEnd: () => setProgress(false),
        })
    }, [])

    if (!progress) return undefined

    return <svg className='progress-svg' viewBox='-26 -26 52 52'>
        <circle className='progress-circle' fill='none' cx='0' cy='0' r='20' strokeWidth='4'/>
    </svg>
}
