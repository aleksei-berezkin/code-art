<style>
    .rasterize-font-canvas {
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
        padding-right: 1em;
        text-align: right;
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

    .color-scheme-wr {
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: .5em;
    }

    .color-scheme-select {
        margin-right: 4em;
        width: 240px;
    }

    .code-canvas {
        aspect-ratio: 3/2;
        max-width: 1280px;
        width: 90%;
    }
</style>

<canvas class='rasterize-font-canvas' bind:this={ rasterCanvasEl } width='2048'></canvas>
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
        <div class='color-scheme-wr'>
            <label class='color-scheme-label' for={toId('scheme')}>color scheme</label>
            <select class='color-scheme-select' id={toId('scheme')} bind:value={selectedColorSchemeName} on:change={handleColorSchemeChange}>
                {#each colorSchemeNames as scheme}
                    <option value={scheme}>{scheme}</option>
                {/each}
            </select>
        </div>
    </div>
    <canvas class='code-canvas' bind:this={ codeCanvasEl }></canvas>
</section>
    
<svelte:window on:resize={ handleResize }/>

<script lang='ts'>
    import { onMount } from 'svelte';
    import { Transformations, TxType } from './Transformations';
    import { drawCodeScene } from './drawCodeScene';
    import { rasterizeFont, GlyphRaster} from './rasterizeFont';
    import { getSource, Source } from './getSource';
    import { dpr } from './util/dpr';
    import { degToRag } from './util/degToRad';
    import { colorSchemeNames } from './colorSchemes';
    import { randomItem } from './util/randomItem';
    import { colorizeCode } from './colorizeCode';
    import { drawEffectsScene } from './drawEffectsScene';

    function toId(k: string) {
        return 'code-scene-control-' + k.replace(/\s/g, '-');
    }

    function toLabelNum(tx: TxType, val: number) {
        let s = '';
        if (tx === 'angle x' || tx === 'angle y' || tx === 'angle z') {
            s = `${val / Math.PI * 180}\u00B0`;
        }
        if (tx === 'translate x' || tx === 'translate y' || tx === 'translate z' || tx === 'scroll') {
            s = `${val}%`;
        }
        if (tx === 'font size') {
            s = String(val);
        }
        return s.replace(/-/, '\u2212');
    }
   
    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;

    const source = getSource();

    const transformations: Transformations = {
        'angle x': {
            min: degToRag(-20),
            val: degToRag(-15) + Math.random() * degToRag(30),
            max: degToRag(20),
        },
        'angle y': {
            min: degToRag(-20),
            val: degToRag(-15) + Math.random() * degToRag(30),
            max: degToRag(20),
        },
        'angle z': {
            min: -Math.PI / 2,
            val: (-.05 + Math.random() * .1) * Math.PI / 2,
            max: Math.PI / 2,
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
        'scroll': {
            min: 0,
            val: Math.random() * 100,
            max: 100,
        },
        'font size': {
            min: 5,
            val: 36,
            max: 120,
        }
    };

    let selectedColorSchemeName = randomItem(colorSchemeNames);

    let glyphRaster: GlyphRaster;

    onMount(() => {
        handleResize();
        source.then(src => {
            _rasterizeFont(src);
            _drawScene(src);
        });
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
        source.then(src => {
            if (tx === 'font size') {
                _rasterizeFont(src);
            }
            _drawScene(src);
        });
    }

    function handleColorSchemeChange() {
        source.then(src => _drawScene(src));
    }

    function _rasterizeFont(source: Source) {
        glyphRaster = rasterizeFont(source, rasterCanvasEl, transformations['font size'].val);
    }

    function _drawScene(source: Source) {
        const codeSceneDrawn = drawCodeScene(codeCanvasEl, rasterCanvasEl, transformations, source, colorizeCode(source, selectedColorSchemeName), glyphRaster);
        drawEffectsScene(codeCanvasEl, codeSceneDrawn, transformations['font size'].val);
    }
</script>
