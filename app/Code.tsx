'use client'

import './Code.css'

import { About } from './About';
import { delayToAnimationFrame } from './util/delay';
import { dpr } from './util/dpr';
import { drawRandomScene, drawScene } from './draw/drawScene';
import { fitViewRatio, getFractionFromDisplayedRatio } from './model/ratios';
import { getSliderVal, ImgParams } from './model/ImgParams';
import { ImgParamsMenu } from './ImgParamsMenu';
import { Icon } from './Icon';
import { setTaskExecutorListeners, submitTask } from './util/submitTask';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useStore } from './store';

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


    const openDialog = useStore(state => state.openDialog)
    const setOpenDialog = useStore(state => state.setOpenDialog)

    const imgParams = useStore(state => state.imgParams)
    const setImgParams = useStore(state => state.setImgParams)

    function handleRootClick(e: MouseEvent) {
        let current = e.target as Element | null
        while (current) {
            if (current.classList.contains('dialog-layer')) return
            current = current.parentElement
        }
        setOpenDialog(undefined)
    }

    function handleImgParamsButtonClick(e: MouseEvent) {
        setOpenDialog(openDialog === 'menu' ? undefined : 'menu')
        e.stopPropagation()
    }

    // In Safari sizes may be not ready on mount, that's why raf
    useEffect( () => {
        (async () => {
            await setCodeCanvasWH()
            await generateScene(true);
        })()
    }, [])

    const [generateRotateDeg, setGenerateRotateDeg] = useState(0)
    async function handleGenerateClick() {
        if (imgParams) {
            setGenerateRotateDeg(generateRotateDeg + 360)
            await generateScene()
        }
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
        );
    }

    async function onParamsUpdate(newParams: ImgParams, updatedSize: boolean) {
        setImgParams({...newParams})

        submitTask(async () => {
            if (imgParams) {
                if (updatedSize) {
                    updateCodeCanvasStyle();
                    await setCodeCanvasWH();
                }
                await drawScene(
                    imgParams,
                    codeCanvasRef.current!,
                    alphabetCanvasRef.current!,
                    attributionCanvasRef.current!,
                    selfAttrCanvasRef.current!,
                    updatedSize,
                    () => setImgParams({...imgParams}),
                );
            }
        });
    }

    useEffect(() => {
        async function drawOnResize() {
            submitTask(async () => {
                if (imgParams) {
                    updateCodeCanvasStyle()
                    await setCodeCanvasWH()
                    await drawScene(
                        imgParams,
                        codeCanvasRef.current!,
                        alphabetCanvasRef.current!,
                        attributionCanvasRef.current!,
                        selfAttrCanvasRef.current!,
                        true,
                        () => setImgParams({...imgParams}),
                    );
                }
            });
        }
        window.addEventListener('resize', drawOnResize)
        return () => window.removeEventListener('resize', drawOnResize)
    }, [imgParams])

    const [codeCanvasModifier, setCodeCanvasModifier] = useState<'fit' | 'aspect'>('fit')

    async function updateCodeCanvasStyle() {
        if (imgParams) {
            const r = imgParams['output image'].ratio.val;
            setCodeCanvasModifier(r === fitViewRatio ? 'fit' : 'aspect')

            const sizeFr = getSliderVal(imgParams['output image'].size);
            codeCanvasRef.current!.style.setProperty('--s', String(sizeFr));

            if (r !== fitViewRatio) {
                codeCanvasRef.current!.style.setProperty('--a', `calc(${getFractionFromDisplayedRatio(r)})`);
            }
        }
    }

    async function setCodeCanvasWH() {
        await delayToAnimationFrame(); // Make sure layout happened
        const canvasRect = codeCanvasRef.current!.getBoundingClientRect();
        codeCanvasRef.current!.width = canvasRect.width * dpr();
        codeCanvasRef.current!.height = canvasRect.height * dpr();
    }

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

    const [progress, setProgress] = useState(false)
    useEffect(() => {
        setTaskExecutorListeners({
            onStart: () => setProgress(true),
            onEnd: () => setProgress(false),
        })
    }, [])


    return <main ref={mainRef} onClick={handleRootClick}>
        <canvas className='alphabet-canvas' ref={alphabetCanvasRef} width='2048' />
        <canvas className='attribution-canvas' ref={attributionCanvasRef}/>
        <canvas className='self-attr-canvas' ref={selfAttrCanvasRef} />
        <canvas className={`code-canvas ${codeCanvasModifier}`} ref={codeCanvasRef} />

        <button className='round-btn left' onClick={handleImgParamsButtonClick}>
            <Icon pic={(openDialog === 'menu') ? 'close' : 'menu'}/>
        </button>
        <button className='round-btn second-to-right' onClick={handleGenerateClick}>
            <Icon pic='reload' rotateDeg={generateRotateDeg}/>
        </button>
        <button className='round-btn right' onClick={handleDownloadClick}>
            <Icon pic={downloading ? 'pending' : 'download'}/>
        </button>

        <ImgParamsMenu paramsUpdated={onParamsUpdate} />

        {
            progress &&
            <svg className='progress-svg' viewBox='-26 -26 52 52'>
                <circle className='progress-circle' fill='none' cx='0' cy='0' r='20' strokeWidth='4'/>
            </svg>
        }

        <About/>
    </main>
}

