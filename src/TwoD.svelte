<canvas class='rasterize-font-canvas' bind:this={ rasterCanvasEl }></canvas>
<section>
    <div class='sliders'>
        {#each allTxWithoutScale as tx}
            <div class='slider-wr'>
                <label for={toId(tx)}>{tx}</label>
                <input id={toId(tx)} data-tx={tx} type='range' min='-1' max='1' step='any' value='0' on:input={handleTxChange}/>
            </div>
        {/each}
    </div>
    <canvas class='code-canvas' bind:this={ codeCanvasEl }></canvas>
</section>
    
<svelte:window on:resize={ handleResize }/>

<script lang='ts'>
    import { onMount } from 'svelte';
    import { drawScene } from './drawScene';
    import {allTx, allTxWithoutScale, Transformations, TxType} from './txType';
    import {drawGridScene} from "./drawGridScene";
    import {rasterizeFont, RasterLetter} from "./rasterizeFont";
    import {getSource} from "./getSource";

    function toId(tx: string) {
        return 'two-d-slider-' + tx.replace(/\s/g, '-');
    }

    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;

    const source = getSource();

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

    const  fontSize = 72;
    let lettersMap: Map<string, RasterLetter>;

    onMount(() => {
        handleResize();
        source.then(src => {
            lettersMap = rasterizeFont(src, rasterCanvasEl, fontSize);
            drawGridScene(codeCanvasEl, rasterCanvasEl, transformations, src, fontSize, lettersMap);
        })
    });

    function handleResize() {
        const canvasRect = codeCanvasEl.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        codeCanvasEl.width = canvasRect.width * dpr;
        codeCanvasEl.height = canvasRect.height * dpr;
    }

    function handleTxChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const tx = inputEl.dataset.tx as TxType;
        transformations[tx] = Number(inputEl.value);
        source.then(src => drawGridScene(codeCanvasEl, rasterCanvasEl, transformations, src, fontSize, lettersMap));
    }
</script>

<style>
    .rasterize-font-canvas {
        font-family: Menlo, Consolas, monospace;
        width: 2048px;
        height: 512px;
    }

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

    .code-canvas {
        aspect-ratio: 3/2;
        max-width: 1280px;
        width: 90%;
    }
</style>
