<style>
    .rasterize-font-canvas {
        left: 0;
        position: absolute;
        transform: translateY(-150%);
        top: 0;
        width: 2048px;
    }

    .section-main {
        align-items: center;
        display: flex;
        flex-direction: column;
        --bord-r-std: 8px;
        --btn-size: 48px;
        --btn-pic-size: 32px;
        --pad-std: 16px;
        --tr-fast: 150ms;
        --tr-std: 250ms;
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

    .round-btn {
        align-items: center;
        background: #ffffffc0;
        border: none;
        border-radius: 50%;
        box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
        cursor: pointer;
        display: flex;
        justify-content: center;
        height: var(--btn-size);
        margin: 0;
        padding: 0;
        position: absolute;
        transition: background-color var(--tr-std);
        top: var(--pad-std);
        width: var(--btn-size);
        -webkit-tap-highlight-color: transparent;
    }

    .round-btn.left {
        left: var(--pad-std);
    }

    .round-btn.second-to-right {
        right: calc(var(--pad-std) * 2 + var(--btn-size));
    }

    .round-btn.right {
        right: var(--pad-std);
    }

    .round-btn:hover {
        background: #ffffffe0;
    }

    .round-btn:active {
        background: #fffffff8;
    }

    .btn-pic {
        fill: #000000d0;
        height: var(--btn-pic-size);
        stroke: none;
        transition: transform var(--tr-std);
        width: var(--btn-pic-size);
    }

    .btn-pic.rotate180 {
        transform: rotate(-180deg);
    }
</style>

<canvas class='rasterize-font-canvas' bind:this={rasterCanvasEl} width='2048'></canvas>
<section class='section-main'>
    <div class='code-wr'>
        <canvas class='code-canvas' bind:this={codeCanvasEl}></canvas>
        <button class='round-btn left' on:click={() => menuOpen = !menuOpen}>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' class={`btn-pic ${menuOpen ? 'rotate180' : ''}`}><path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z'/></svg>
        </button>
        <button class='round-btn second-to-right' on:click={handleGenerateClick}>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox="0 0 24 24" class='btn-pic'><path d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/></svg>
        </button>
        <button class='round-btn right' on:click={() => {}}>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' class='btn-pic'><path d='M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z'/></svg>
        </button>
        {#if imgParams}
            <ImgParamsMenu imgParams={imgParams} menuOpen={menuOpen} paramsUpdated={onParamsUpdate} clickedOutside={onClickedOutsideMenu}/>
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

    let imgParams: ImgParams | undefined = undefined;
    let menuOpen = false;
    
    onMount(function () {
        generateScene(36);
    });

    function handleGenerateClick() {
        if (imgParams) {
            // The only preserved param
            const fontSize = imgParams.font['font size'].val;
            generateScene(fontSize);
        }
    }

    function generateScene(fontSize: number) {
        setWH();
        const sourceName = pickRandom(sourceCodeNames);
        getSource(sourceName).then(source => {
            const glyphRaster = rasterizeFont(source, rasterCanvasEl, fontSize);
            const allParams = genAllParams(getW(), getH(), fontSize, source, glyphRaster);
            imgParams = allParams.imgParams;
            drawScene(allParams.pixelSpace, allParams.extensions, source, allParams.imgParams, allParams.txMat, glyphRaster);
        });
    }
        

    function onParamsUpdate() {
        if (!imgParams) {
            return;
        }

        const pixelSpace = makePixelSpace(getW(), getH(), percentLogToVal(imgParams.fade.blur.val));
        const xAngle = imgParams.angle['angle x'].val;
        const yAngle = imgParams.angle['angle y'].val;
        const zAngle = imgParams.angle['angle z'].val;
        const extensions = calcExtensions(pixelSpace, xAngle, yAngle, zAngle);
        getSource(imgParams.source['source'].val as SourceCodeName).then(source => {
            if (!imgParams) {
                return;
            }

            const glyphRaster = rasterizeFont(source, rasterCanvasEl, imgParams.font['font size'].val);
            const txMat = getTxMax(pixelSpace,
                xAngle, yAngle, zAngle,
                imgParams.position['translate x'].val, imgParams.position['translate y'].val, imgParams.position['translate z'].val
            );
            drawScene(pixelSpace, extensions, source, imgParams, txMat, glyphRaster);
        })
    }

    function onClickedOutsideMenu() {
        menuOpen = false;
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
