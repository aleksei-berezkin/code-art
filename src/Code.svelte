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
        background-color: #eee;
        width: 100%;
    }

    .code-canvas.progress {
        animation-duration: 2s;
        animation-fill-mode: forwards;
        animation-name: progress-animation;
    }

    /* TODO not the best */
    @keyframes progress-animation {
        from {
            filter: grayscale(0) opacity(1);
        }
        to {
            filter: grayscale(50%) opacity(.5);
        }
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
        <canvas class={`code-canvas ${progress ? 'progress' : ''}`} bind:this={codeCanvasEl}></canvas>
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
    import { drawRandomScene, drawScene } from './draw/drawScene';

    let codeCanvasEl: HTMLCanvasElement;
    let rasterCanvasEl: HTMLCanvasElement;

    let progress = false;

    let imgParams: ImgParams | undefined = undefined;
    let menuOpen = false;

    let genRotateDeg = 0;

    // In Safari sizes may be not ready on mount, that's why raf
    onMount(() => requestAnimationFrame(async () => await generateScene()));

    async function handleGenerateClick() {
        if (imgParams) {
            genRotateDeg += 360;
            await generateScene();
        }
    }

    async function generateScene() {
        setWH();
        await drawRandomScene(
            codeCanvasEl,
            rasterCanvasEl,
            () => progress = true,
            p => {
                progress = false;
                imgParams = p;
            },
        );
    }

    let downloading = false;
    function handleDownload() {
        if (!downloading) {
            downloading = true;
            codeCanvasEl.toBlob(blob => {
                const a = document.createElement('a');
                const objUrl = URL.createObjectURL(blob);
                a.href = objUrl;
                a.download = 'CodeArt.png';
                a.click();
                setTimeout(
                    () => downloading = false,
                    1200,
                );
                setTimeout(() => URL.revokeObjectURL(objUrl), 5000);
            });
        }
    }

    async function onParamsUpdate() {
        if (!imgParams) {
            return;
        }

        await drawScene(imgParams, codeCanvasEl, rasterCanvasEl, p => imgParams = p);
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
