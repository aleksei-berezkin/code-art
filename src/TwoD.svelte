<section>
    <div class='sliders'>
        {#each allTxWithoutScale as tx}
            <div class='slider-wr'>
                <label for={toId(tx)}>{tx}</label>
                <input id={toId(tx)} data-tx={tx} type='range' min='-1' max='1' step='any' value='0' on:input={handleTxChange}/>
            </div>
        {/each}
    </div>
    <canvas bind:this={ canvasEl }></canvas>
</section>
    
<svelte:window on:resize={ handleResize }/>

<script lang='ts'>
    import { onMount } from 'svelte';
    import { drawScene } from './drawScene';
    import {allTx, allTxWithoutScale, Transformations, TxType} from './txType';
    import {drawGridScene} from "./drawGridScene";

    function toId(tx: string) {
        return 'two-d-slider-' + tx.replace(/\s/g, '-');
    }

    let canvasEl: HTMLCanvasElement;

    const transformations: Transformations = {
        'scale x': 0,
        'scale y': 0,
        'angle x': 0,
        'angle y': 0,
        'angle z': 0,
        'translate x': 0,
        'translate y': 0,
        'translate z': 0,
    };

    onMount(() => {
        handleResize();
        drawGridScene(canvasEl, transformations);
    });

    function handleResize() {
        const canvasRect = canvasEl.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasEl.width = canvasRect.width * dpr;
        canvasEl.height = canvasRect.height * dpr;
    }

    function handleTxChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const tx = inputEl.dataset.tx as TxType;
        transformations[tx] = Number(inputEl.value);
        drawGridScene(canvasEl, transformations);
    }
</script>

<style>
    section {
        align-items: center;
        display: flex;
        flex-direction: column;
    }

    .sliders {
    }

    .slider-wr {
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    input {
        margin: 0 0 0 .5em;
        padding-left: 0;
        padding-right: 0;
    }

    canvas {
        aspect-ratio: 3/2;
        max-width: 1280px;
        width: 90%;
    }
</style>
