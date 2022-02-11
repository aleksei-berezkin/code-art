<style>
    .about {
        background-color: #ffffffe0;
        border-radius: var(--bord-r-std);
        box-sizing: border-box;
        box-shadow: var(--menu-shadow);
        left: 50%;
        padding: var(--pad-std);
        position: absolute;
        transform: translateX(-50%);
        top: var(--pad-std);
        width: calc(min(60vw, 520px));
    }
</style>

<section class='about' bind:this={rootEl}>
    <h1>Code Art</h1>
    <p>Abstract code artworks for your creations.</p>
    <h2>License</h2>
    <p>Both code and generated images are licensed under <a href='https://creativecommons.org/licenses/by/4.0/' target='_blank'>CC BY 4.0</a>.
        Please give attribution when use.</p>
    <h2>Have any feedback?</h2>
    <p>You are welcome:</p>
    <Contacts size='md'/>
    <h2><button><Icon pic='arrow-down'/> Credits</button></h2>
    
</section>

<script lang='ts'>
    import { onDestroy, onMount } from 'svelte';
    import { createCloseBehavior } from './util/createCloseBehavior';
    import Contacts from './Contacts.svelte';
    import Icon from './Icon.svelte';

    export let closeDialog: () => void;

    let rootEl: HTMLElement;

    const closeBehavior = createCloseBehavior();
    onMount(() => closeBehavior.attachDeferred(rootEl, closeDialog));
    onDestroy(closeBehavior.detach);
</script>
