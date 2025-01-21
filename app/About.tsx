import './About.css';

import { createRef, useEffect, useState } from 'react';
import { Contacts } from './Contacts';
import { Icon } from './Icon';
import { fontFacesForRandomScenes } from './model/fontFaces';
import { sourceSpecs } from './model/sourceSpecs';
import { createCloseBehavior } from './util/createCloseBehavior';

export function About({ closeDialog }: { closeDialog: () => void }) {
    const rootRef = createRef<HTMLElement>()
    useEffect(() => {
        const closeBehavior = createCloseBehavior()
        closeBehavior.attachDeferred(rootRef.current!, closeDialog)
        return () => closeBehavior.detach()
    }, [closeDialog])

    const [creditsOpen, setCreditsOpen] = useState(false)

    function toggleCredits() {
        setCreditsOpen(!creditsOpen)
    }
    
    return <section className='about' ref={rootRef}>
        <button className='close-wr' onClick={closeDialog}>
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
            <h2><button onClick={toggleCredits}><Icon pic='arrow-down' rotateDeg={creditsOpen ? -180 : 0}/><span className='credits-text'>Credits</span></button></h2>
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
