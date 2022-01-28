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
    import { dpr } from './util/dpr';
    import ImgParamsMenu from './ImgParamsMenu.svelte';
    import { onMount } from 'svelte';
    import Icon from './Icon.svelte';
    import { parseMs } from './util/parseMs';
    import { drawRandomScene, drawScene } from './draw/drawScene';
    import { interrupted } from './util/interrupted';

    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;

    let imgParams: ImgParams | undefined = undefined;
    let menuOpen = false;

    let genRotateDeg = 0;

    const fontSize = 36;

    onMount(async function () {
        await generateScene(fontSize);
    });


    function handleGenerateClick() {
        if (imgParams) {
            const icTxMs = parseMs(getComputedStyle(document.body).getPropertyValue('--ic-tx'));
            genRotateDeg += 360;
            setTimeout(async () => {
                await generateScene(fontSize);
            }, icTxMs + 10);
        }
    }

    async function generateScene(fontSize: number) {
        setWH();
        try {
            const p = await drawRandomScene(fontSize, codeCanvasEl, rasterCanvasEl);
            if (p) {
                imgParams = p;
            }
        } catch (e) {
            if (e !== interrupted) {
                throw e;
            }
        }
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

    async function onParamsUpdate() {
        if (!imgParams) {
            return;
        }

        try {
            await drawScene(imgParams, codeCanvasEl, rasterCanvasEl);
        } catch (e) {
            if (e !== interrupted) {
                throw e;
            }
        }
    }

    function onClickedOutsideMenu() {
        menuOpen = false;
    }

    function setWH() {
        const canvasRect = codeCanvasEl.getBoundingClientRect();
        codeCanvasEl.width = canvasRect.width * dpr;
        codeCanvasEl.height = canvasRect.height * dpr;
    }
</script>
