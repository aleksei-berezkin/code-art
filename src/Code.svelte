<canvas class='rasterize-font-canvas' bind:this={ rasterCanvasEl }></canvas>
<section>
    <div class='sliders'>
        {#each Object.entries(transformations) as tx}
            <div class='slider-wr'>
                <label class='slider-label' for={toId(tx[0])}>{tx[0]}</label>
                <div class='slider-min'>{toLabelNum(tx[0], tx[1].min)}</div>
                <input class='slider-slider' id={toId(tx[0])} data-tx={tx[0]} type='range' min='{tx[1].min}' max='{tx[1].max}' step='any' value='{tx[1].val}' on:input={handleTxChange}/>
                <div class='slider-max'>{toLabelNum(tx[0], tx[1].max)}</div>
            </div>
        {/each}
    </div>
    <canvas class='code-canvas' bind:this={ codeCanvasEl }></canvas>
</section>
    
<svelte:window on:resize={ handleResize }/>

<script lang='ts'>
    import { onMount } from 'svelte';
    import { Transformations, TxType } from './Transformations';
    import { drawGridScene } from './drawGridScene';
    import { rasterizeFont, RasterLetter } from './rasterizeFont';
    import { getSource } from './getSource';
    import { dpr } from './getDpr';

    function toId(tx: string) {
        return 'two-d-slider-' + tx.replace(/\s/g, '-');
    }

    function toLabelNum(tx: TxType, val: number) {
        let s = '';
        if (tx === 'angle x' || tx === 'angle y' || tx === 'angle z') {
            s = `${val / Math.PI * 180}\u00B0`;
        }
        if (tx === 'translate x' || tx === 'translate y' || tx === 'translate z') {
            s = `${val}%`;
        }
        return s.replace(/-/, '\u2212');
    }
   
    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;

    const source = getSource();

    const transformations: Transformations = {
        'angle x': {
            min: -Math.PI / 8,
            val: (-.25 + Math.random() * .5) * Math.PI / 8,
            max: Math.PI / 8,
        },
        'angle y': {
            min: -Math.PI / 8,
            val: (-.2 + Math.random() * .4) * Math.PI / 8,
            max: Math.PI / 8,
        },
        'angle z': {
            min: -Math.PI,
            val: (-.05 + Math.random() * .1) * Math.PI,
            max: Math.PI,
        },
        'translate x': {
            // percent
            min: -100,
            val: 0,
            max: 100,
        },
        'translate y': {
            min: -100,
            val: 0,
            max: 100,
        },
        'translate z': {
            min: -100,
            val: 0,
            max: 100,
        },
    };

    const fontSize = 72;
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
        codeCanvasEl.width = canvasRect.width * dpr;
        codeCanvasEl.height = canvasRect.height * dpr;
    }

    function handleTxChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const tx = inputEl.dataset.tx as TxType;
        transformations[tx].val = Number(inputEl.value);
        source.then(src => drawGridScene(codeCanvasEl, rasterCanvasEl, transformations, src, fontSize, lettersMap));
    }
</script>

<style>
    .rasterize-font-canvas {
        height: 256px;
        left: 0;
        position: absolute;
        transform: translateY(-150%);
        top: 0;
        width: 2048px;
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
        margin-bottom: .5em;
    }

    .slider-label {
        flex-grow: 1;
        text-align: left;
    }

    .slider-min {
        padding-left: 1em;
        text-align: left;
        width: 4em;
    }

    .slider-slider {
        margin: 0;
        max-width: 50vw;
        padding: 0;
        width: 240px;
    }

    .slider-max {
        width: 4em;
        text-align: right;
    }

    .code-canvas {
        aspect-ratio: 3/2;
        max-width: 1280px;
        width: 90%;
    }
</style>
