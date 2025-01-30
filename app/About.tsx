import './About.css';

import { createRef, useState } from 'react';
import { Contacts } from './Contacts';
import { Icon } from './Icon';
import { fontFacesForRandomScenes } from './model/fontFaces';
import { sourceSpecs } from './model/sourceSpecs';
import { useStore } from './store';

export function About() {
    const rootRef = createRef<HTMLElement>()

    const [creditsOpen, setCreditsOpen] = useState(false)

    const isOpen = useStore(state => state.openDialog === 'about')
    const setOpenDialog = useStore(state => state.setOpenDialog)

    if (!isOpen) return undefined

    function toggleCredits() {
        setCreditsOpen(!creditsOpen)
    }
    
    return <section className='about dialog-layer' ref={rootRef}>
        <button className='close-wr' onClick={() => setOpenDialog(undefined)}>
            <Icon pic='close'/>
        </button>
        <div className='scroll-container'>
            <h1>Code Art</h1>
            <p>Abstract code artworks for your creations</p>
            <h2>License</h2>
            <p>Generated images are licensed under <a href='https://creativecommons.org/licenses/by/4.0/' target='_blank'>CC BY 4.0</a>.
                Rendered code fragments have their own licenses, see &ldquo;Credits&rdquo;.
                If you remove attribution watermarks please make sure to give your own attribution both to <a href='https://code-art.pictures/'>code-art.pictures</a> and to rendered code fragment.
            </p>
            <h2>Any feedback is welcome</h2>
            <Contacts size='md' color='dark'/>
            <h2><button onClick={toggleCredits}><div className={`arrow-down-wrapper ${creditsOpen ? 'open' : ''}`}><Icon pic='arrow-down'/></div><span className='credits-text'>Credits</span></button></h2>
            {
                creditsOpen &&
                <>
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
                    <div className='version'>App version: {codeArtVersion}</div>
                </>
            }
        </div>
    </section>
}

declare const codeArtDeps: string[]
declare const codeArtVersion: string

function getDepLink(dep: string) {
    if (dep === 'node') {
        return 'https://nodejs.org/';
    }
    if (dep === 'npm') {
        return 'https://www.npmjs.com/';
    }
    return `https://npmjs.com/package/${dep}`;
}
