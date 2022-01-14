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
        <ImgParamsMenu imgParams={imgParams} paramsUpdated={onParamsUpdate}/>
    {/if}
    <canvas class='code-canvas' bind:this={codeCanvasEl}></canvas>
</section>
    
<script lang='ts'>
    import { ImgParams } from './ImgParams';
    import { drawCodeScene } from './drawCodeScene';
    import { GlyphRaster, rasterizeFont } from './rasterizeFont';
    import { getSource, Source, SourceCodeName, sourceCodeNames } from './souceCode';
    import { dpr } from './util/dpr';
    import { drawEffectsScene } from './drawEffectsScene';
    import { genAllParams } from './genAllParams';
    import ImgParamsMenu from './ImgParamsMenu.svelte';
    import type { Extensions, PixelSpace } from "./PixelSpace";
    import { onMount } from 'svelte';
    import { pickRandom } from './util/pickRandom';
    import { calcExtensions, makePixelSpace } from './PixelSpace';
    import { percentLogToVal } from './util/percentLogToVal';
    import type { Mat4 } from './util/matrices';
    import { getTxMax } from './getTxMax';

    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;

    let imgParams: ImgParams | undefined = undefined;
    
    onMount(function () {
        setWH();
        const sourceName = pickRandom(sourceCodeNames);
        const fontSize = 36;
        getSource(sourceName).then(source => {
            const glyphRaster = rasterizeFont(source, rasterCanvasEl, fontSize);
            const allParams = genAllParams(getW(), getH(), fontSize, source, glyphRaster);
            imgParams = allParams.imgParams;
            drawScene(allParams.pixelSpace, allParams.extensions, source, allParams.imgParams, allParams.txMat, glyphRaster);
        });
    });

    function onParamsUpdate() {
        const pixelSpace = makePixelSpace(getW(), getH(), percentLogToVal(imgParams!.blur.val));
        const xAngle = imgParams!['angle x'].val;
        const yAngle = imgParams!['angle y'].val;
        const zAngle = imgParams!['angle z'].val;
        const extensions = calcExtensions(pixelSpace, xAngle, yAngle, zAngle);
        getSource(imgParams!['source'].val as SourceCodeName).then(source => {
            const glyphRaster = rasterizeFont(source, rasterCanvasEl, imgParams!['font size'].val);
            const txMat = getTxMax(pixelSpace,
                xAngle, yAngle, zAngle,
                imgParams!['translate x'].val, imgParams!['translate y'].val, imgParams!['translate z'].val
            );
            drawScene(pixelSpace, extensions, source, imgParams!, txMat, glyphRaster);
        })
    }

    function drawScene(pixelSpace: PixelSpace, extensions: Extensions, source: Source, imgParams: ImgParams, txMat: Mat4, glyphRaster: GlyphRaster) {
        const codeSceneDrawn = drawCodeScene(codeCanvasEl, rasterCanvasEl, pixelSpace, extensions, imgParams, txMat, source, glyphRaster);
        drawEffectsScene(codeCanvasEl, codeSceneDrawn, imgParams);
    }

    function getW() {
        return codeCanvasEl.width / dpr;
    }

    function getH() {
        return codeCanvasEl.height / dpr;
    }

    function setWH() {
        const canvasRect = codeCanvasEl.getBoundingClientRect();
        codeCanvasEl.width = canvasRect.width * dpr;
        codeCanvasEl.height = canvasRect.height * dpr;
    }
</script>
