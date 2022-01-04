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
        {#each Object.entries(imgParams) as p}
            {#if p[1].type === 'slider'}
                <div class='slider-wr'>
                    <label class='slider-label' for={toId(p[0])}>{p[0]}</label>
                    <div class='slider-min'>{toLabelNum(p[0], p[1].min)}</div>
                    <!--suppress XmlDuplicatedId -->
                    <input class='slider-slider' id={toId(p[0])} data-k={p[0]} type='range' min='{p[1].min}' max='{p[1].max}' step='any' value='{p[1].val}' on:input={handleSliderChange}/>
                    <div class='slider-max'>{toLabelNum(p[0], p[1].max)}</div>
                </div>
            {/if}

            {#if p[1].type === 'choices'}
                <div class='color-scheme-wr'>
                    <label class='color-scheme-label' for={toId(p[0])}>{p[0]}</label>
                    <!--suppress XmlDuplicatedId -->
                    <select class='color-scheme-select' id={toId(p[0])} data-k={p[0]} on:change={handleChoiceChange}>
                        {#each p[1].choices as choice}
                            {#if p[1].val === choice}
                                <option value={choice} selected>{choice}</option>
                            {:else}
                                <option value={choice}>{choice}</option>
                            {/if}
                        {/each}
                    </select>
                </div>
            {/if}

        {/each}
    </div>
    <canvas class='code-canvas' bind:this={ codeCanvasEl }></canvas>
</section>
    
<svelte:window on:resize={ handleResize }/>

<script lang='ts'>
    import { onMount } from 'svelte';
    import {ImgParams, ParamChoiceKey, ParamKey, ParamSliderKey} from './ImgParams';
    import { drawCodeScene } from './drawCodeScene';
    import { rasterizeFont, GlyphRaster } from './rasterizeFont';
    import {getSource, Source, SourceCodeName, sourceCodeNames} from './souceCode';
    import { dpr } from './util/dpr';
    import { degToRag } from './util/degToRad';
    import { ColorSchemeName, colorSchemeNames } from './colorSchemes';
    import { randomItem } from './util/randomItem';
    import { colorizeCode } from './colorizeCode';
    import { drawEffectsScene } from './drawEffectsScene';

    function toId(k: string) {
        return 'code-scene-control-' + k.replace(/\s/g, '-');
    }

    function toLabelNum(k: ParamKey, val: number) {
        let s = '';
        if (k === 'angle x' || k === 'angle y' || k === 'angle z') {
            s = `${val / Math.PI * 180}\u00B0`;
        }
        if (k === 'translate x' || k === 'translate y' || k === 'translate z' || k === 'scroll') {
            s = `${val}%`;
        }
        if (k === 'font size') {
            s = String(val);
        }
        return s.replace(/-/, '\u2212');
    }
   
    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;

    const imgParams: ImgParams = {
        'angle x': {
            type: 'slider',
            min: degToRag(-20),
            val: degToRag(-15) + Math.random() * degToRag(30),
            max: degToRag(20),
        },
        'angle y': {
            type: 'slider',
            min: degToRag(-20),
            val: degToRag(-15) + Math.random() * degToRag(30),
            max: degToRag(20),
        },
        'angle z': {
            type: 'slider',
            min: -Math.PI / 2,
            val: (-.05 + Math.random() * .1) * Math.PI / 2,
            max: Math.PI / 2,
        },
        'translate x': {
            type: 'slider',
            // percent
            min: -100,
            val: 0,
            max: 100,
        },
        'translate y': {
            type: 'slider',
            min: -100,
            val: 0,
            max: 100,
        },
        'translate z': {
            type: 'slider',
            min: -100,
            val: 0,
            max: 100,
        },
        'scroll': {
            type: 'slider',
            min: 0,
            val: Math.random() * 100,
            max: 100,
        },
        'font size': {
            type: 'slider',
            min: 5,
            val: 36,
            max: 120,
        },
        'color scheme': {
            type: 'choices',
            val: randomItem(colorSchemeNames),
            choices: colorSchemeNames,
        },
        'source': {
            type: 'choices',
            val: randomItem(sourceCodeNames),
            choices: sourceCodeNames,
        },
        'glow color': {
            type: 'color',
            val: '#201008',
        },
        'fade in distortion': {
            type: 'color',
            val: '#000000',
        },
        'fade out distortion': {
            type: 'color',
            val: '#000000',
        },
    };

    let glyphRaster: GlyphRaster;

    onMount(() => {
        handleResize();
        _getSource().then(src => {
            _rasterizeFont(src);
            _drawScene(src);
        });
    });

    function handleResize() {
        const canvasRect = codeCanvasEl.getBoundingClientRect();
        codeCanvasEl.width = canvasRect.width * dpr;
        codeCanvasEl.height = canvasRect.height * dpr;
    }

    function handleSliderChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const k = inputEl.dataset.k as ParamSliderKey;
        imgParams[k].val = Number(inputEl.value);
        _getSource().then(src => {
            if (k === 'font size') {
                _rasterizeFont(src);
            }
            _drawScene(src);
        });
    }

    function handleChoiceChange(e: Event) {
        const selectEl = (e.target as HTMLSelectElement);
        const k = selectEl.dataset.k as ParamChoiceKey;
        selectEl.selectedIndex
        imgParams[k].val = imgParams[k].choices[selectEl.selectedIndex];
        _getSource().then(src => {
            if (k === 'source') {
                _rasterizeFont(src);
            }
            _drawScene(src);
        });
    }

    function _getSource() {
        return getSource(imgParams['source'].val as SourceCodeName);
    }

    function _rasterizeFont(source: Source) {
        glyphRaster = rasterizeFont(source, rasterCanvasEl, imgParams['font size'].val);
    }

    function _drawScene(source: Source) {
        const codeSceneDrawn = drawCodeScene(codeCanvasEl, rasterCanvasEl, imgParams, source, colorizeCode(source, imgParams['color scheme'].val as ColorSchemeName), glyphRaster);
        drawEffectsScene(codeCanvasEl, codeSceneDrawn, imgParams['font size'].val);
    }
</script>
