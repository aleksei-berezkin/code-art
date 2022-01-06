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
    <ImgParamsMenu imgParams={imgParams} paramsUpdated={p => imgParams = p}/>
    <canvas class='code-canvas' bind:this={codeCanvasEl}></canvas>
</section>
    
<script lang='ts'>
    import { ImgParams } from './ImgParams';
    import { drawCodeScene } from './drawCodeScene';
    import { rasterizeFont } from './rasterizeFont';
    import { getSource, SourceCodeName } from './souceCode';
    import { dpr } from './util/dpr';
    import { drawEffectsScene } from './drawEffectsScene';
    import { createImgParams } from './createImgParams';
    import ImgParamsMenu from './ImgParamsMenu.svelte';

    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;
    let imgParams = createImgParams();

    $: drawScene(imgParams);

    async function drawScene(imgParams: ImgParams /* reactivity */) {
        const source = await getSource(imgParams['source'].val as SourceCodeName);
        _setWH();
        const glyphRaster = rasterizeFont(source, rasterCanvasEl, imgParams['font size'].val);
        const codeSceneDrawn = drawCodeScene(codeCanvasEl, rasterCanvasEl, imgParams, source, glyphRaster);
        drawEffectsScene(codeCanvasEl, codeSceneDrawn, imgParams);
    }

    function _setWH() {
        const canvasRect = codeCanvasEl.getBoundingClientRect();
        codeCanvasEl.width = canvasRect.width * dpr;
        codeCanvasEl.height = canvasRect.height * dpr;
    }
</script>
