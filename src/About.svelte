<style>
    .about {
        --m: .9rem;

        background-color: #ffffffe0;
        border-radius: var(--bord-r-std);
        box-sizing: border-box;
        box-shadow: var(--menu-shadow);
        left: 50%;
        max-height: calc(100vh - 2 * var(--pad-std));
        overflow: scroll;
        padding: var(--pad-std);
        position: absolute;
        transform: translateX(-50%);
        top: var(--pad-std);
        width: calc(min(80vw, 520px));
    }

    .credits-text {
        padding-left: var(--m);
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

<section class='about' bind:this={rootEl}>
    <h1>Code Art</h1>
    <p>Abstract code artworks for your creations</p>
    <h2>License</h2>
    <p>Both code and generated images are licensed under <a href='https://creativecommons.org/licenses/by/4.0/' target='_blank'>CC BY 4.0</a>.
        Please give attribution when use.</p>
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
            <li><a href='https://worldvectorlogo.com/ru/logo/devto' target='_blank'>DEV logo</a></li>
        </ul>
        <h3>Rendered code</h3>
        <ul>
            {#each Object.entries(sourceSpecs) as [k, s]}
                <li><a href={s.url} target='_blank'>{k}</a></li>
            {/each}
        </ul>
        <h3>Software components</h3>
        <ul>
            <li><a href='https://github.com/acornjs/acorn' target='_blank'>Acorn</a></li>
            <li><a href='https://svelte.dev/' target='_blank'>Svelte</a></li>
            <li><a href='https://www.typescriptlang.org/' target='_blank'>TypeScript</a></li>
            <li><a href='https://webpack.js.org/' target='_blank'>webpack</a></li>
        </ul>
        <p>See full list in <a href='https://github.com/aleksei-berezkin/code-art/blob/main/package.json' target='_blank'>project dependencies</a></p>
        <h3>Misc</h3>
        <ul>
            <li><a href='https://webgl2fundamentals.org/' target='_blank'>WebGL2 Fundamentals</a></li>
            <li><a href='https://svgcrop.com/' target='_blank'>Crop SVG</a></li>
        </ul>
    {/if}
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
</script>
