'use client'

import { About } from './About'
import { delay, delayToAnimationFrame } from './util/delay'
import { dpr } from './util/dpr'
import { drawRandomScene, drawScene } from './draw/drawScene'
import { fitViewRatio, getFractionFromDisplayedRatio } from './model/ratios'
import { getSliderVal } from './model/ImgParams'
import { ImgParamsMenu } from './ImgParamsMenu'
import { Icon } from './Icon'
import { submitTask } from './util/submitTask'
import { type MouseEvent, type RefObject, useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { calcOptimalFontSize } from './draw/calcOptimalFontSize'
import { getPixelSpaceSize } from './draw/getPixelSpaceSize'

// TODO imports before 'use client'
import type { Var, Css } from 'typique'
import { themeVars, type ThemeVars } from './theme'
import { parseMs } from './util/parseMs'
import { centeredAbsClass, type centeredAbsVar } from './centeredAbs'
import { cc } from 'typique/util'

export const mainSizeVars = {
    // We can't use vh in mobile browsers because it may result in vertical scroll
    // So we introduce like 'container-height' properties
    h: '--main-size-h',
    w: '--main-size-w',
} as const satisfies Var

export const dialogLayerClass = 'dialog-layer' satisfies Css<{
    // TODO Marker class, must have empty styles
    display: 'block'
}>

export function Main() {
    const mainRef = useRef<HTMLElement>(null)
    useEffect(() => {
        function setMainSizeVars() {
            const rect = mainRef.current!.getBoundingClientRect()
            mainRef.current!.style.setProperty(mainSizeVars.h, `${rect.height}px`)
            mainRef.current!.style.setProperty(mainSizeVars.w, `${rect.width}px`)
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
            if (current.classList.contains(dialogLayerClass)) return
            current = current.parentElement
        }
        setOpenDialog(undefined)
    }

    return <main ref={mainRef} onClick={handleRootClick} className={ 'main-main' satisfies Css<{
        display: 'flex'
        height: '100%'
        margin: 0
        padding: 0
        width: '100%'
        [mainSizeVars.h]: '100%'
        [mainSizeVars.w]: '100%'
        '& > canvas:nth-child(-n + 3)': {
            left: 0
            position: 'fixed'
            transform: 'translateY(-150%)'
            top: 0
        }
    }> }>
        <canvas ref={alphabetCanvasRef} width='2048' />
        <canvas ref={attributionCanvasRef}/>
        <canvas ref={selfAttrCanvasRef} />

        <CodeCanvas index={0} codeCanvasRef={codeCanvas0Ref}/>
        <CodeCanvas index={1} codeCanvasRef={codeCanvas1Ref}/>

        <Progress/>

        <ImgParamsMenuButton/>
        <ImgParamsMenu/>
        <GenerateButton/>
        <DownloadButton codeCanvas0Ref={codeCanvas0Ref} codeCanvas1Ref={codeCanvas1Ref}/>

        <About/>
    </main>
}

function CodeCanvas({index, codeCanvasRef}: {index: 0 | 1, codeCanvasRef: RefObject<HTMLCanvasElement | null>}) {
    const ratio = useStore(state => state.imgParams ? state.imgParams['output image'].ratio.val : undefined)
    const sizeFr = useStore(state => state.imgParams ? getSliderVal(state.imgParams['output image'].size) : undefined)
    const opaque = useStore(state => !!state.imgParams && (!index || state.currentCanvas))

    const isAspect = ratio && ratio !== fitViewRatio

    const sizeFractionVar = '--size-fraction' satisfies Var
    const outlineHVar = '--outline-h' satisfies Var
    const outlineWVar = '--outline-w' satisfies Var
    const aspectVar = '--aspect' satisfies Var

    return (
        <canvas
            className={ cc(
                // TODO must be code-canvas-canvas
                'code-canvas' satisfies Css<{
                    [sizeFractionVar]: '1'
                    [outlineHVar]: `calc(var(${typeof mainSizeVars.h}) * var(${typeof sizeFractionVar}))`
                    [outlineWVar]: `calc(var(${typeof mainSizeVars.w}) * var(${typeof sizeFractionVar}))`
                    [centeredAbsVar.h]: `var(${typeof outlineHVar})`
                    [centeredAbsVar.w]: `var(${typeof outlineWVar})`
                    transition: `opacity var(${ThemeVars['mainTx']})`
                }>,
                centeredAbsClass,
                isAspect && 'code-canvas-2' satisfies Css<{
                    [centeredAbsVar.h]: `calc(min(var(${typeof outlineHVar}), var(${typeof outlineWVar}) / var(${typeof aspectVar})))`
                    [centeredAbsVar.w]: `calc(min(var(${typeof outlineWVar}), var(${typeof outlineHVar}) * var(${typeof aspectVar})))`
                }>,
                !opaque && 'code-canvas-4' satisfies Css<{
                    opacity: 0
                }>,
            ) }
            style={{
                [sizeFractionVar]: sizeFr && String(sizeFr),
                [aspectVar]: ratio && ratio !== fitViewRatio && `calc(${getFractionFromDisplayedRatio(ratio)})`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any}
            ref={codeCanvasRef}
        />
    )
}

function Progress() {
    const visible = useStore(state => state.progress)
    const [running, setRunning] = useState(false)

    const svgRef = useRef<SVGSVGElement | null>(null)

    useEffect(() => {
        if (visible && !running) {
            setRunning(true)
        } else if (!visible && running) {
            const txMs = window.getComputedStyle(svgRef.current!).getPropertyValue(themeVars.mainTx)
            const timerId = setTimeout(
                () => setRunning(false),
                parseMs(txMs) ?? 0 + 100,
            )
            return () => clearTimeout(timerId)
        }
    }, [visible, running])

    const r = 20
    const strokeWidth = 4
    const maxShadow = 2

    const lVar = '--l' satisfies Var
    type LVar = typeof lVar

    const arc0Var = '--arc0' satisfies Var
    const gap50Var = '--gap50' satisfies Var
    const arc50Var = '--arc50' satisfies Var

    const [circleClass,,] = ['circle', 'cn', 'cn-0'] satisfies Css<{
        animation: `$1 1.4s ease-in-out infinite, $2 1.4s linear infinite`
        filter: `drop-shadow(0 0 calc(min(1px + .1vw, ${typeof maxShadow}px)) #fff9)`
        [lVar]: `calc(2 * 3.14159 * ${typeof r}px)`
        [arc0Var]: `calc(var(${LVar}) * 2 / 360)`
        [gap50Var]: `calc(var(${LVar}) * 35 / 360)`
        [arc50Var]: `calc(var(${LVar}) - 2 * var(${typeof gap50Var}))`
        '@keyframes $1': {
            '0%': {
                strokeDashoffset: 0;
                strokeDasharray: `var(${typeof arc0Var}), var(${LVar})`
            }
            '50%': {
                strokeDashoffset: `calc(-1 * var(${typeof gap50Var}))`
                strokeDasharray: `var(${typeof arc50Var}), var(${LVar})`
            }
            '100%': {
                strokeDashoffset: `calc(-1 * var(${LVar}))`
                strokeDasharray: `var(${typeof arc0Var}), var(${LVar})`
            }
        }
        '@keyframes $2': {
            '0%': {
                transform: 'rotate(0deg)'
            }
            '100%': {
                transform: 'rotate(360deg)'
            }
        }
    }>

    const viewBoxSize = r * 2 + strokeWidth * 2 + maxShadow * 2

    return (
        <svg
            ref={ svgRef }
            viewBox={ `${-viewBoxSize / 2} ${-viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}` }
            className={ cc(
                'progress-svg' satisfies Css<{
                    stroke: '#fff8'
                    transition: `opacity var(${ThemeVars['mainTx']})`
                    [centeredAbsVar.h]: 'calc(min(140px, 60vmin))'
                    [centeredAbsVar.w]: `var(${typeof centeredAbsVar.h})`
                }>,
                centeredAbsClass,
                !visible && 'progress-svg-0' satisfies Css<{
                    opacity: 0
                }>,
            ) }
        >
            <circle
                fill='none'
                cx='0'
                cy='0'
                r={r}
                strokeWidth={strokeWidth}
                className={ cc(
                    circleClass,
                    !running && 'progress-svg-1' satisfies Css<{
                        animationPlayState: 'paused'
                    }>,
                )}
            />
        </svg>
    )
}

const buttonShadowColorVar = '--button-shadow-color' satisfies Var

const useRoundButtonClass = () => useStore(state =>
    cc(
        'round-button' satisfies Css<{
            background: `var(${ThemeVars['menuBgCol']})`
            backdropFilter: `var(${ThemeVars['menuBackdropFilter']})`
            borderRadius: '50%'
            boxShadow: `3px 0 6px 0px var(${typeof buttonShadowColorVar}), -1px 4px 8px 1px var(${typeof buttonShadowColorVar})`
            color: '#000d'
            height: `var(${ThemeVars['buttonSize']})`
            overflow: `hidden`
            position: `absolute`
            transition: `
                background-color var(${ThemeVars['mainTx']}),
                box-shadow var(${ThemeVars['mainTx']}),
                color var(${ThemeVars['mainTx']}),
                transform var(${ThemeVars['mainTx']}),
                scale var(${ThemeVars['mainTx']})`
            top: `var(${ThemeVars['paddingStd']})`
            width: `var(${ThemeVars['buttonSize']})`
            [buttonShadowColorVar]: 'rgb(60 64 67 / 55%)'

            '&:hover': {
                background: '#ffffffe0'
                color: '#000'
                [buttonShadowColorVar]: 'rgb(160 164 167 / 55%)'
            }

            '&:active': {
                background: '#fff'
                color: '#000'
                [buttonShadowColorVar]: 'rgb(180 184 187 / 55%)'
            }
        }>,

        !state.imgParams && 'round-button-0' satisfies Css<{
            scale: 0
        }>,
    )
)


function ImgParamsMenuButton() {
    const isOpen = useStore(state => state.openDialog === 'menu')
    const setOpenDialog = useStore(state => state.setOpenDialog)

    function handleClick() {
        setOpenDialog(isOpen ? undefined : 'menu')
    }

    const [btnIconWrapperClass, hidden] = ['btn-icon-wrapper', 'hidden'] satisfies Css<{
        alignItems: 'center'
        height: '100%'
        display: 'flex'
        justifyContent: 'center'
        left: 0
        position: 'absolute'
        top: 0
        transition: `opacity var(${ThemeVars['mainTx']}), transform var(${ThemeVars['mainTx']})`
        width: '100%'

        '&.$1': {
            opacity: 0
            transform: 'scale(.25)'
        }
    }>

    return (
        <button
            onClick={ handleClick }
            className={ cc(
                useRoundButtonClass(),
                dialogLayerClass,
                'img-params-menu-button-button' satisfies Css<{
                    left: `var(${ThemeVars['paddingStd']})`
                }>,
            ) }
        >
            <div className={cc(btnIconWrapperClass, isOpen && hidden)}>
                <Icon pic='menu'/>
            </div>
            <div className={cc(btnIconWrapperClass, !isOpen && hidden)}>
                <Icon pic='close'/>
            </div>
        </button>
    )
}


function GenerateButton() {
    const generateCounter = useStore(state => state.generateCounter)
    const incGenerateCounter = useStore(state => state.incGenerateCounter)

    return (
        <button
            onClick={incGenerateCounter}
            className={ cc(
                useRoundButtonClass(),
                'generate-button-button' satisfies Css<{
                    right: `calc(var(${ThemeVars['paddingStd']}) * 2 + var(${ThemeVars['buttonSize']}))`
                }>,
            ) }
        >
            <div
                className={ 'generate-button-div' satisfies Css<{
                    alignItems: 'center'
                    display: 'flex'
                    justifyContent: 'center'
                    transition: `transform var(${ThemeVars['mainTx']})`
                }> }
                style={{
                    transform: `rotate(${Math.max(1 /* Skip 1st generation */, generateCounter) * 360}deg)`,
                }}
            >
                <Icon pic='reload' />
            </div>
        </button>
    )
}

function DownloadButton({codeCanvas0Ref, codeCanvas1Ref}: {codeCanvas0Ref: RefObject<HTMLCanvasElement | null>, codeCanvas1Ref: RefObject<HTMLCanvasElement | null>}) {
    function handleDownloadClick() {
        const canvas = (useStore.getState().currentCanvas ? codeCanvas1Ref : codeCanvas0Ref).current!
        canvas.toBlob(blob => {
            const a = document.createElement('a')
            const objUrl = URL.createObjectURL(blob!)
            a.href = objUrl
            a.download = 'CodeArt.png'
            a.click()
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
        <button
            onClick={handleDownloadClick}
            className={ cc(
                useRoundButtonClass(),
                'download-button-button' satisfies Css<{
                    right: `var(${ThemeVars['paddingStd']})`
                }>,
            ) }
        >
            <div
                className={ cc(
                    'download-button-div' satisfies Css<{
                        alignItems: 'center'
                        boxSizing: 'border-box'
                        display: 'flex'
                        flexDirection: 'column'
                        height: '200%'
                        justifyContent: 'space-around'
                        position: 'absolute'
                        top: '-100%'
                        width: '100%'
                    }>,
                    sliding && 'download-button-div-0' satisfies Css<{
                        top: 0
                        transition: `top ${typeof animationDuration}ms`
                    }>,
                ) }
            >
                <Icon pic='download'/>
                <Icon pic='download'/>
            </div>
        </button>
    )
}

function useDrawing(
    alphabetCanvasRef: RefObject<HTMLCanvasElement | null>,
    attributionCanvasRef: RefObject<HTMLCanvasElement | null>,
    selfAttrCanvasRef: RefObject<HTMLCanvasElement | null>,
    codeCanvas0Ref: RefObject<HTMLCanvasElement | null>,
    codeCanvas1Ref: RefObject<HTMLCanvasElement | null>,
) {
    useEffect(() => {
        useStore.getState().incGenerateCounter()

        const incDrawCounter = useStore.getState().incDrawCounter
        window.addEventListener('resize',  incDrawCounter)
        return () => window.removeEventListener('resize', incDrawCounter)
    }, [])

    const generateCounter = useStore(state => state.generateCounter)
    const drawCounter = useStore(state => state.drawCounter)

    const prevGenerateCounter = useRef(generateCounter)
    const prevDrawCounter = useRef(drawCounter)

    useEffect(() => {
        const generate = generateCounter !== prevGenerateCounter.current
        const draw = !generate && useStore.getState().imgParams && drawCounter !== prevDrawCounter.current

        if (generate || draw)
            submitTask(async () => {
                const nextCanvasIndex = useStore.getState().currentCanvas ? 0 : 1
                const nextCanvas = (nextCanvasIndex ? codeCanvas1Ref : codeCanvas0Ref).current!

                const canvasSizeUpdated = await updateCanvasWidthHeightAccordingToClientRect(nextCanvas)
                if (draw && canvasSizeUpdated) {
                    const newFontSize = calcOptimalFontSize(getPixelSpaceSize(nextCanvas))
                    useStore.getState().updateImgParams(draft => {
                        draft.font.size.val = newFontSize
                    })
                }

                if (generate)
                    await drawRandomScene(
                        useStore.getState().imgParams,
                        nextCanvas,
                        alphabetCanvasRef.current!,
                        attributionCanvasRef.current!,
                        selfAttrCanvasRef.current!,
                        useStore.getState().setImgParams,
                    )
                else
                    await drawScene(
                        useStore.getState().imgParams!,
                        nextCanvas,
                        alphabetCanvasRef.current!,
                        attributionCanvasRef.current!,
                        selfAttrCanvasRef.current!,
                    )

                useStore.getState().setCurrentCanvas(nextCanvasIndex)
            })

        prevGenerateCounter.current = generateCounter
        prevDrawCounter.current = drawCounter
    }, [generateCounter, drawCounter, alphabetCanvasRef, attributionCanvasRef, selfAttrCanvasRef, codeCanvas1Ref, codeCanvas0Ref])
}

async function updateCanvasWidthHeightAccordingToClientRect(codeCanvas: HTMLCanvasElement) {
    // Make sure layout happened
    // In Safari sizes may be not ready on mount, raf helps
    await delayToAnimationFrame()

    const prevWidth = codeCanvas.width
    const prevHeight = codeCanvas.height

    const clientRect = codeCanvas.getBoundingClientRect()

    const newWidth = clientRect.width * dpr()
    const newHeight = clientRect.height * dpr()

    if (prevWidth !== newWidth || prevHeight !== newHeight) {
        codeCanvas.width = newWidth
        codeCanvas.height = newHeight
        return true
    }

    return false
}
