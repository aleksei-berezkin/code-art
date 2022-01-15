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

    .code-wr {
        max-width: 1280px;
        position: relative;
        width: 90%;
    }

    .code-canvas {
        aspect-ratio: 3/2;
        width: 100%;
    }

    .btn-img-params {
        align-items: center;
        background: #ffffffd0;
        border: none;
        border-radius: 50%;
        box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
        cursor: pointer;
        display: flex;
        justify-content: center;
        left: 16px;
        height: 48px;
        margin: 0;
        padding: 0;
        position: absolute;
        transition: background-color 200ms;
        top: 16px;
        width: 48px;
    }

    .btn-img-params:hover {
        background: #ffffffe0;
    }

    .btn-img-params:active {
        background: #fffffff0;
    }

    .btn-dd {
        fill: #000000e0;
        height: 32px;
        stroke: none;
        width: 32px;
    }

    .menu-wr {
        border-radius: 8px;
        overflow: hidden;
        position: absolute;
        top: 80px;
        left: 16px;
    }

    .menu-body {
        opacity: 0;
        transform: scale(0);
        transform-origin: top left;
        transition: transform 150ms, opacity 150ms;
    }

    .menu-body.shown {
        opacity: 1;
        transform: scale(1);
    }
</style>

<canvas class='rasterize-font-canvas' bind:this={rasterCanvasEl} width='2048'></canvas>
<section>
    <div class='code-wr'>
        <canvas class='code-canvas' bind:this={codeCanvasEl}></canvas>
        <button class='btn-img-params' on:click={() => menuShown = !menuShown}>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' class='btn-dd' fill='#000000'><path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z'/></svg>
        </button>
        {#if imgParams}
            <div class='menu-wr'>
                <div class={ `menu-body ${menuShown ? 'shown' : ''}` } >
                    <ImgParamsMenu imgParams={imgParams} paramsUpdated={onParamsUpdate}/>
                </div>
            </div>
        {/if}
    </div>
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

    let menuShown = false;
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
