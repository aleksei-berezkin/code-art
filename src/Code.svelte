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
        box-shadow: var(--btn-shadow);
        cursor: pointer;
        display: flex;
        justify-content: center;
        height: var(--btn-size);
        margin: 0;
        padding: 0;
        position: absolute;
        transition: background-color 250ms;
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
            <Icon pic={menuOpen ? 'close' : 'menu'}/>
        </button>
        <button class='round-btn second-to-right' on:click={handleGenerateClick}>
            <Icon pic='reload' rotateDeg={genRotateDeg}/>
        </button>
        <button class='round-btn right' on:click={handleDownload}>
            <Icon pic={downloading ? 'pending' : 'download'}/>
        </button>
        {#if imgParams}
            <ImgParamsMenu imgParams={imgParams} menuOpen={menuOpen} paramsUpdated={onParamsUpdate} clickedOutside={onClickedOutsideMenu}/>
        {/if}
    </div>
</section>
    
<script lang='ts'>
    import { ImgParams } from './model/ImgParams';
    import { drawCodeScene } from './draw/drawCodeScene';
    import { GlyphRaster, rasterizeFont } from './draw/rasterizeFont';
    import { getSource, Source, SourceCodeName, sourceCodeNames } from './model/souceCode';
    import { dpr } from './util/dpr';
    import { drawEffectsScene } from './draw/drawEffectsScene';
    import { genAllParams } from './model/genAllParams';
    import ImgParamsMenu from './ImgParamsMenu.svelte';
    import type { Extensions, PixelSpace } from "./model/PixelSpace";
    import { onMount } from 'svelte';
    import { pickRandom } from './util/pickRandom';
    import { calcExtensions, makePixelSpace } from './model/PixelSpace';
    import { percentLogToVal } from './util/percentLogToVal';
    import type { Mat4 } from './util/matrices';
    import { getTxMax } from './model/getTxMax';
    import Icon from './Icon.svelte';
    import { parseMs } from './util/parseMs';

    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;

    let imgParams: ImgParams | undefined = undefined;
    let menuOpen = false;

    let genRotateDeg = 0;

    onMount(function () {
        generateScene(36);
    });


    function handleGenerateClick() {
        if (imgParams) {
            const icTxMs = parseMs(getComputedStyle(document.body).getPropertyValue('--ic-tx'));
            genRotateDeg += 360;
            setTimeout(() => {
                // The only preserved param
                const fontSize = imgParams!.font.size.val;
                generateScene(fontSize);
            }, icTxMs + 10);
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

    let downloading = false;
    function handleDownload() {
        if (!downloading) {
            downloading = true;
            setTimeout(
                () => downloading = false,
                1000,
            );
        }
    }

    function onParamsUpdate() {
        if (!imgParams) {
            return;
        }

        const pixelSpace = makePixelSpace(getW(), getH(), percentLogToVal(imgParams.fade.blur.val));
        const xAngle = imgParams.angle.x.val;
        const yAngle = imgParams.angle.y.val;
        const zAngle = imgParams.angle.z.val;
        const extensions = calcExtensions(pixelSpace, xAngle, yAngle, zAngle);
        getSource(imgParams.source['source'].val as SourceCodeName).then(source => {
            if (!imgParams) {
                return;
            }

            const glyphRaster = rasterizeFont(source, rasterCanvasEl, imgParams.font.size.val);
            const txMat = getTxMax(pixelSpace,
                xAngle, yAngle, zAngle,
                imgParams.position.x.val, imgParams.position.y.val, imgParams.position.z.val
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
