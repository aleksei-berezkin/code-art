<style>
    main {
        align-items: center;
        display: flex;
        flex-direction: column;
        height: 100%;
        margin: 0;
        width: 100%;
    }

    .alphabet-canvas, .attribution-canvas {
        left: 0;
        position: absolute;
        transform: translateY(-150%);
        top: 0;
    }

    .code-wr {
        height: 100%;
        position: relative;
        width: 100%;
    }

    .code-canvas {
        background-color: #707688;
        height: 100%;
        width: 100%;
    }

    .progress-svg {
        --s: calc(min(120px, 200px + 15vw));

        height: var(--s);
        left: calc(50vw - var(--s) * .5);
        position: absolute;
        top: calc(50vh - var(--s) * .5);
        stroke: #fff8;
        width: var(--s);
    }

    .progress-circle {
        animation: arc-anim 1.7s ease-in-out infinite, rotation-anim 1.7s linear infinite;
        animation-delay: -.9s;
        filter: drop-shadow(0 0 calc(min(1px + .1vw, 2px)) #fff9);
        box-shadow: var(--btn-shadow);
    }

    /*
     * l = 2 * pi * 20 = 125.66
     */
    @keyframes arc-anim {
        0% {
            stroke-dashoffset: 0;
            stroke-dasharray: .5, 125.66;
        }
        50% {
            stroke-dashoffset: -18;
            stroke-dasharray: 100, 125.66;
        }
        100% {
            stroke-dashoffset: -125.66;
            stroke-dasharray: 100, 125.66;
        }
    }

    @keyframes rotation-anim {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .round-btn {
        align-items: center;
        background: #ffffffc0;
        border-radius: 50%;
        box-shadow: var(--btn-shadow);
        color: #000d;
        display: flex;
        justify-content: center;
        height: var(--btn-size);
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

<main>
    <canvas class='alphabet-canvas' bind:this={alphabetCanvasEl} width='2048'></canvas>
    <canvas class='attribution-canvas' bind:this={attributionCanvasEl}></canvas>
    <div class='code-wr'>
        <canvas class='code-canvas' bind:this={codeCanvasEl}></canvas>
        <button class='round-btn left' on:click={handleMenuClick}>
            <Icon pic={(openDialog === 'menu') ? 'close' : 'menu'}/>
        </button>
        <button class='round-btn second-to-right' on:click={handleGenerateClick}>
            <Icon pic='reload' rotateDeg={genRotateDeg}/>
        </button>
        <button class='round-btn right' on:click={handleDownload}>
            <Icon pic={downloading ? 'pending' : 'download'}/>
        </button>
    </div>
    {#if progress}
        <svg class='progress-svg' viewBox='-26 -26 52 52' xmlns='http://www.w3.org/2000/svg'>
            <circle class='progress-circle' fill='none' cx='0' cy='0' r='20' stroke-width='4' xmlns='http://www.w3.org/2000/svg'/>
        </svg>
    {/if}
    {#if imgParams}
        <ImgParamsMenu imgParams={imgParams}
                       menuOpen={openDialog === 'menu'}
                       paramsUpdated={onParamsUpdate}
                       closeMenu={closeMenu}
                       clickedAbout={onClickedAbout}
        />
    {/if}
    {#if openDialog === 'about'}
        <About closeDialog={closeAbout}/>
    {/if}
</main>
    
<script lang='ts'>
    import { ImgParams } from './model/ImgParams';
    import { dpr } from './util/dpr';
    import ImgParamsMenu from './ImgParamsMenu.svelte';
    import { onMount } from 'svelte';
    import Icon from './Icon.svelte';
    import { drawRandomScene, drawScene } from './draw/drawScene';
    import { setThrottleListeners, throttle, throttleFast } from './util/throttle';
    import About from './About.svelte';

    let codeCanvasEl: HTMLCanvasElement;
    let alphabetCanvasEl: HTMLCanvasElement;
    let attributionCanvasEl: HTMLCanvasElement;

    let progress = false;

    let imgParams: ImgParams | undefined = undefined;
    let openDialog: 'menu' | 'about' | undefined = undefined;

    let genRotateDeg = 0;

    // In Safari sizes may be not ready on mount, that's why raf
    onMount(() => {
        setThrottleListeners(
            () => progress = true,
            () => progress = false,
        );
        requestAnimationFrame(async () => await generateScene());
    });

    function handleMenuClick() {
        if (openDialog === 'menu') {
            openDialog = undefined;
        } else {
            openDialog = 'menu';
        }
    }

    async function handleGenerateClick() {
        if (imgParams) {
            genRotateDeg += 360;
            await generateScene();
        }
    }

    async function generateScene() {
        throttleFast(async () => {
            setWH();
            await drawRandomScene(
                codeCanvasEl,
                alphabetCanvasEl,
                attributionCanvasEl,
                p => imgParams = p,
            );
        })
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
        throttle(async () => {
            if (imgParams) {
                await drawScene(
                    imgParams,
                    codeCanvasEl,
                    alphabetCanvasEl,
                    attributionCanvasEl,
                );
            }
        })
    }

    function onClickedAbout() {
        openDialog = 'about';
    }

    function closeMenu() {
        if (openDialog === 'menu') {
            openDialog = undefined;
        }
    }

    function closeAbout() {
        if (openDialog === 'about') {
            openDialog = undefined;
        }
    }


    function setWH() {
        const canvasRect = codeCanvasEl.getBoundingClientRect();
        codeCanvasEl.width = canvasRect.width * dpr;
        codeCanvasEl.height = canvasRect.height * dpr;
    }
</script>
