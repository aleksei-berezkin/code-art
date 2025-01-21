<style>
</style>

<section class='about' bind:this={rootEl}>
    <button class='close-wr' on:click={closeDialog}>
        <Icon pic='close'/>
    </button>
    <div class='scroll-container'>
        <h1>Code Art</h1>
        <p>Abstract code artworks for your creations</p>
        <h2>License</h2>
        <p>Generated images are licensed under <a href='https://creativecommons.org/licenses/by/4.0/' target='_blank'>CC BY 4.0</a>.
            Rendered code fragments have their own licenses, see &ldquo;Credits&rdquo;.
            If you remove attribution watermarks please make sure to give your own attribution both to <a href='https://code-art.pictures/'>code-art.pictures</a> and to rendered code fragment.
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
                {#each [...fontFacesForRandomScenes, 'Roboto', 'Ubuntu'].sort() as f}
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
            <div class='version'>App version: {window.appVersion}</div>
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
