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

    .code-canvas {
        aspect-ratio: 3/2;
        max-width: 1280px;
        width: 90%;
    }
</style>

<canvas class='rasterize-font-canvas' bind:this={rasterCanvasEl} width='2048'></canvas>
<section>
    {#if imgParams}
        <ImgParamsMenu imgParams={imgParams} paramsUpdated={p => imgParams = p}/>
    {/if}
    <canvas class='code-canvas' bind:this={codeCanvasEl}></canvas>
</section>
    
<script lang='ts'>
    import { ImgParams } from './ImgParams';
    import { drawCodeScene } from './drawCodeScene';
    import { rasterizeFont } from './rasterizeFont';
    import { Source } from './souceCode';
    import { dpr } from './util/dpr';
    import { drawEffectsScene } from './drawEffectsScene';
    import { createSpaceAndImgParams } from './createSpaceAndImgParams';
    import ImgParamsMenu from './ImgParamsMenu.svelte';
    import type {Extensions, PixelSpace} from "./PixelSpace";
    import { onMount } from 'svelte';

    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;

    let pixelSpace: PixelSpace | undefined = undefined;
    let extensions: Extensions | undefined = undefined;
    let source: Source | undefined = undefined;
    let imgParams: ImgParams | undefined = undefined;
    
    onMount(function () {
        setWH();
        createSpaceAndImgParams(codeCanvasEl.width / dpr, codeCanvasEl.height / dpr)
            .then(spaceAndParams => {
                pixelSpace = spaceAndParams.pixelSpace;
                extensions = spaceAndParams.extensions;
                source = spaceAndParams.source;
                imgParams = spaceAndParams.imgParams;
            });
    });

    $: {
        if (pixelSpace && extensions && source && imgParams) {
            drawScene(pixelSpace, extensions, source, imgParams);
        }
    }

    // Params passed for reactivity
    async function drawScene(pixelSpace: PixelSpace, extensions: Extensions, source: Source, imgParams: ImgParams) {
        const glyphRaster = rasterizeFont(source, rasterCanvasEl, imgParams['font size'].val);
        const codeSceneDrawn = drawCodeScene(codeCanvasEl, rasterCanvasEl, pixelSpace, extensions, imgParams, source, glyphRaster);
        drawEffectsScene(codeCanvasEl, codeSceneDrawn, imgParams);
    }

    function setWH() {
        const canvasRect = codeCanvasEl.getBoundingClientRect();
        codeCanvasEl.width = canvasRect.width * dpr;
        codeCanvasEl.height = canvasRect.height * dpr;
    }
</script>
