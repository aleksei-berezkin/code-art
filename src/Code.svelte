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

</style>

<canvas class='rasterize-font-canvas' bind:this={rasterCanvasEl} width='2048'></canvas>
<section class='section-main'>
    <div class='code-wr'>
        <canvas class='code-canvas' bind:this={codeCanvasEl}></canvas>
        <button class='round-btn left' on:click={() => menuOpen = !menuOpen}>
            <Icon pic='arrow down' rotate={menuOpen}/>
        </button>
        <button class='round-btn second-to-right' on:click={handleGenerateClick}>
            <Icon pic='reload'/>
        </button>
        <button class='round-btn right' on:click={() => {}}>
            <Icon pic='download'/>
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
    import Icon from './Icon.svelte';

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
