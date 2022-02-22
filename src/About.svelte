<style>
    .about {
        --m: .9rem;

        background-color: #ffffffe0;
        border-radius: var(--bord-r-std);
        box-sizing: border-box;
        box-shadow: var(--menu-shadow);
        left: 50%;
        position: absolute;
        transform: translateX(-50%);
        top: var(--pad-std);
        width: calc(min(80vw, 520px));
    }

    .about.credits-open {
        /* Overflow + max-height may force browser to remove nav overlays and extend content size, so setting
         * fixed height. Unfortunately this height looks weird on very tall screens. */
        height: calc(100% - 2 * var(--pad-std));
    }

    .close-wr {
        color: var(--link-c);
        position: absolute;
        padding: calc(var(--pad-std) * .75);
        top: 0;
        transition: color var(--link-tx);
        right: 0;
    }

    .close-wr:hover {
        color: var(--link-c-h);
    }

    .credits-text {
        padding-left: var(--m);
    }

    .scroll-container {
        box-sizing: border-box;
        height: 100%;
        overflow: scroll;
        padding: var(--pad-std);
    }

    h1 {
        margin-top: 0;
    }

    h1, h2, h3, p, ul {
        margin-top: var(--m);
        margin-bottom: var(--m);
    }

    h1 {
        margin-top: 0;
        font-size: 1.7rem;
    }

    ul:last-child {
        margin-bottom: 0;
    }

    h2 {
        font-size: 1.35rem;
    }

    p, li {
        line-height: 1.35em;
    }
</style>

<section class={`about ${creditsOpen ? 'credits-open' : ''}`} bind:this={rootEl}>
    <button class='close-wr' on:click={closeDialog}>
        <Icon pic='close'/>
    </button>
    <div class='scroll-container'>
        <h1>Code Art</h1>
        <p>Abstract code artworks for your creations</p>
        <h2>License</h2>
        <p>Generated images are licensed under <a href='https://creativecommons.org/licenses/by/4.0/' target='_blank'>CC BY 4.0</a>.
            Rendered code fragments have their own licenses, see &ldquo;Credits&rdquo;.
            If you remove attribution watermarks please make sure to give your own attribution both to <a href='https://code-art.pictures/'>code-art.pictures</a> and rendered code fragment.
        </p>
        <h2>Any feedback is welcome</h2>
        <p><Contacts size='md' color='dark'/></p>
        <h2><button on:click={toggleCredits}><Icon pic='arrow-down' rotateDeg={creditsOpen ? -180 : 0}/><span class='credits-text'>Credits</span></button></h2>
        {#if creditsOpen}
            <h3>Color schemes</h3>
            <ul>
                <li><a href='https://code.visualstudio.com/'>VS Code</a></li>
                <li><a href='https://plugins.jetbrains.com/plugin/12275-dracula-theme'>IntelliJ Darkula</a></li>
                <li><a href='https://www.google.com/chrome/'>Chrome browser</a></li>
            </ul>
            <h3>Fonts</h3>
            <p>Free fonts from <a href='https://fonts.google.com/' target='_blank'>Google collection</a></p>
            <ul>
                {#each fontFacesForRandomScenes as f}
                    <li><a href={`https://fonts.google.com/specimen/${f.replace(' ', '+')}`} target='_blank'>{f}</a></li>
                {/each}
            </ul>
            <h3>SVG pics</h3>
            <ul>
                <li><a href='https://fonts.google.com/icons'>Google Fonts Icons</a></li>
                <li><a href='https://mui.com/components/material-icons/' target='_blank'>Material Icons</a></li>
                <li><a href='https://worldvectorlogo.com/ru/logo/devto' target='_blank'>DEV logo</a> from <a href='https://worldvectorlogo.com/'>worldvectorlogo</a></li>
            </ul>
            <h3>Rendered code</h3>
            <ul>
                {#each Object.entries(sourceSpecs) as [k, s]}
                    <li><a href={s.url} target='_blank'>{k}</a></li>
                {/each}
            </ul>
            <h3>Software deps</h3>
            <ul>
                {#each window.appDeps as dep}
                    <li><a href={getDepLink(dep)} target='_blank'>{dep}</a></li>
                {/each}
            </ul>
            <h3>Misc</h3>
            <ul>
                <li><a href='https://webgl2fundamentals.org/' target='_blank'>WebGL2 Fundamentals</a></li>
                <li><a href='https://svgcrop.com/' target='_blank'>Crop SVG</a></li>
            </ul>
        {/if}
    </div>
</section>

<script lang='ts'>
    import { onDestroy, onMount } from 'svelte';
    import { createCloseBehavior } from './util/createCloseBehavior';
    import Contacts from './Contacts.svelte';
    import Icon from './Icon.svelte';
    import { fontFacesForRandomScenes } from './model/fontFaces';
    import { sourceSpecs } from './model/sourceSpecs';

    export let closeDialog: () => void;

    const closeBehavior = createCloseBehavior();
    onMount(() => closeBehavior.attachDeferred(rootEl, closeDialog));
    onDestroy(closeBehavior.detach);

    let rootEl: HTMLElement;
    let creditsOpen: boolean = false;

    function toggleCredits() {
        creditsOpen = !creditsOpen;
    }

    function getDepLink(dep: string) {
        if (dep === 'node') {
            return 'https://nodejs.org/';
        }
        if (dep === 'npm') {
            return 'https://www.npmjs.com/';
        }
        return `https://npmjs.com/package/${dep}`;
    }
</script>
