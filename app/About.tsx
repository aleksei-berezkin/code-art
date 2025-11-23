import { useState } from 'react'
import { Contacts } from './Contacts'
import { arrowDownWrapperClass, Icon, wrOpenClass } from './Icon'
import { fontFacesForRandomScenes } from './model/fontFaces'
import { sourceSpecs } from './model/sourceSpecs'
import { useStore } from './store'
import { useLayerStateClass } from './useLayerStateClass'
import type { Css, Var } from 'typique'
import { cc } from './cc'
import type { ThemeVars } from './theme'
import { mainSizeVars, dialogLayerClass } from './Main'

export function About() {
    const layerState = useLayerStateClass(useStore(state => state.openDialog === 'about'))

    const [creditsOpen, setCreditsOpen] = useState(false)
    const [creditsHeight, setCreditsHeight] = useState(0)

    function toggleCredits() {
        setCreditsOpen(!creditsOpen)
    }

    if (!layerState) return undefined

    const mVar = '--m' satisfies Var
    const wVar = '--w' satisfies Var

    return <section
        className={ cc('about-section' satisfies
            Css<{
                [mVar]: '.9rem'
                [wVar]: 'calc(min(80vw, 520px))'

                backgroundColor: `var(${ThemeVars['menuBgCol']})`
                backdropFilter: `var(${ThemeVars['menuBackdropFilter']})`
                borderRadius: `var(${ThemeVars['borderRadiusStd']})`
                boxSizing: 'border-box'
                boxShadow: `var(${ThemeVars['menuShadow']})`
                left: `calc(50% - var(${typeof wVar}) * .5)`
                position: 'absolute'
                top: `var(${ThemeVars['paddingStd']})`
                width: `var(${typeof wVar})`
            }>,
            dialogLayerClass,
            layerState,
        )}
    >
        <button
            className={
                'about-button' satisfies Css<{
                    color: `var(${ThemeVars['linkCol']})`
                    position: 'absolute'
                    padding: `calc(var(${ThemeVars['paddingStd']}) * .75)`
                    top: 0
                    transition: `color var(${ThemeVars['linkTx']})`
                    right: 0
                    '&:hover': {
                        color: `var(${ThemeVars['linkColHover']})`
                    }
                }>
            }
            onClick={() => useStore.getState().setOpenDialog(undefined)}
        >
            <Icon pic='close'/>
        </button>
        <div className={ 'about-div' satisfies Css<{
            boxSizing: 'border-box'
            maxHeight: `calc(var(${typeof mainSizeVars.h}) - 2 * var(${ThemeVars['paddingStd']}))`
            overflow: 'scroll'
            padding: `var(${ThemeVars['paddingStd']})`
            '& h1': {
                marginTop: 0
                fontSize: '1.7rem'
            }
            '& h2, & h2, & h3, & p, & ul': {
                marginTop: `var(${typeof mVar})`
                marginBottom: `var(${typeof mVar})`
            }
            '& ul:last-child': {
                marginBottom: 0
            }
            '& h2': {
                fontSize: '1.35rem'
            }
            '& p, & li': {
                lineHeight: '1.35em'
            }
        }> }>
            <h1>Code Art</h1>
            <p>Abstract code artworks for your creations</p>
            <h2>License</h2>
            <p>Generated images are licensed under <a href='https://creativecommons.org/licenses/by/4.0/' target='_blank'>CC BY 4.0</a>.
                Rendered code fragments have their own licenses, see &ldquo;Credits&rdquo;.
                If you remove attribution watermarks please make sure to give your own attribution both to <a href='https://code-art.pictures/'>code-art.pictures</a> and to rendered code fragment.
            </p>
            <h2>Any feedback is welcome</h2>
            <Contacts size='md' color='dark'/>
            <h2>
                <button onClick={toggleCredits}>
                    <div className={cc(arrowDownWrapperClass, creditsOpen && wrOpenClass)}>
                        <Icon pic='arrowDown'/>
                    </div>
                    <span className={'about-span' satisfies Css<{paddingLeft: `var(${typeof mVar})`}>}>
                        Credits
                    </span>
                </button>
            </h2>
            {
                <div
                    style={{height: creditsOpen ? `${creditsHeight}px` : '0'}}
                    className={ 'about-div-0' satisfies Css<{
                        height: 0
                        overflow: 'hidden'
                        transition: `height var(${ThemeVars['mainTx']})`
                    }> }
                >
                    <div
                        className={ 'about-div-1' satisfies Css<{
                            '& > *:first-child': {
                                // Otherwise this margin would be outside this container
                                // and clientHeight won't include it
                                marginTop: 0
                            }
                        }> }
                        ref={el => setCreditsHeight(el?.clientHeight ?? creditsHeight)}
                    >
                        <h3>Color schemes</h3>
                        <ul>
                            <li><a href='https://code.visualstudio.com/'>VS Code</a></li>
                            <li><a href='https://plugins.jetbrains.com/plugin/12275-dracula-theme'>IntelliJ Darkula</a></li>
                            <li><a href='https://www.google.com/chrome/'>Chrome browser</a></li>
                        </ul>
                        <h3>Fonts</h3>
                        <p>Free fonts from <a href='https://fonts.google.com/' target='_blank'>Google collection</a></p>
                        <ul>
                            {
                                [...fontFacesForRandomScenes, 'Roboto', 'Ubuntu'].sort().map(f =>
                                    <li key={f}><a href={`https://fonts.google.com/specimen/${f.replace(' ', '+')}`} target='_blank'>{f}</a></li>
                                )
                            }
                        </ul>
                        <h3>SVG pics</h3>
                        <ul>
                            <li><a href='https://fonts.google.com/icons'>Google Fonts Icons</a></li>
                            <li><a href='https://mui.com/components/material-icons/' target='_blank'>Material Icons</a></li>
                            <li><a href='https://worldvectorlogo.com/ru/logo/devto' target='_blank'>DEV logo</a> from <a href='https://worldvectorlogo.com/'>worldvectorlogo</a></li>
                        </ul>
                        <h3>Rendered code</h3>
                        <ul>
                            {
                                Object.entries(sourceSpecs).map(([k, s]) =>
                                    <li key={k}><a href={s.url} target='_blank'>{k}</a></li>
                                )
                            }
                        </ul>
                        <h3>Software deps</h3>
                        <ul>
                            {
                                codeArtDeps.map(dep =>
                                    <li key={dep}><a href={getDepLink(dep)} target='_blank'>{dep}</a></li>
                                )
                            }
                        </ul>
                        <h3>Misc</h3>
                        <ul>
                            <li><a href='https://webgl2fundamentals.org/' target='_blank'>WebGL2 Fundamentals</a></li>
                            <li><a href='https://svgcrop.com/' target='_blank'>Crop SVG</a></li>
                            <li><a href='https://online-convert.com/' target='_blank'>Online converter</a></li>
                        </ul>
                        <div className={ 'about-div-2' satisfies Css<{
                            color: '#00000078'
                            textAlign: 'center'
                        }> }>App version: {codeArtVersion}</div>
                    </div>
                </div>
            }
        </div>
    </section>
}

declare const codeArtDeps: string[]
declare const codeArtVersion: string

function getDepLink(dep: string) {
    if (dep === 'node') {
        return 'https://nodejs.org/'
    }
    if (dep === 'npm') {
        return 'https://www.npmjs.com/'
    }
    return `https://npmjs.com/package/${dep}`
}
