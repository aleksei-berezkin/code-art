<style>
    main {
        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        margin: 0;
        width: 100%;
    }

    .alphabet-canvas, .attribution-canvas, .self-attr-canvas {
        left: 0;
        position: absolute;
        transform: translateY(-150%);
        top: 0;
    }

    /* TODO remove? */
    .code-wr {
        /* Overridden in style='' */
        --h: 100vh;
        --w: 100vw;

        position: relative;
    }

    .code-wr.fit {
        height: var(--h);
        width: var(--w);
    }

    .code-wr.aspect {
        --a: calc(1 / 1);

        height: calc(min(var(--h), var(--w) / var(--a)));
        width: calc(min(var(--w), var(--h) * var(--a)));
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
    <canvas class='self-attr-canvas' bind:this={selfAttrCanvasEl}></canvas>

    <div class={`code-wr ${codeWrModifier}`} style={codeWrStyle}>
        <canvas class='code-canvas' bind:this={codeCanvasEl}></canvas>
    </div>

    <button class='round-btn left' on:click={handleImgParamsClick}>
        <Icon pic={(openDialog === 'menu') ? 'close' : 'menu'}/>
    </button>
    <button class='round-btn second-to-right' on:click={handleGenerateClick}>
        <Icon pic='reload' rotateDeg={generateRotateDeg}/>
    </button>
    <button class='round-btn right' on:click={handleDownloadClick}>
        <Icon pic={downloading ? 'pending' : 'download'}/>
    </button>

    {#if imgParams}
        <ImgParamsMenu imgParams={imgParams}
                       menuOpen={openDialog === 'menu'}
                       paramsUpdated={onParamsUpdate}
                       closeMenu={closeImgParams}
                       clickedAbout={handleAboutClick}
        />
    {/if}

    {#if progress}
        <svg class='progress-svg' viewBox='-26 -26 52 52' xmlns='http://www.w3.org/2000/svg'>
            <circle class='progress-circle' fill='none' cx='0' cy='0' r='20' stroke-width='4' xmlns='http://www.w3.org/2000/svg'/>
        </svg>
    {/if}

    {#if openDialog === 'about'}
        <About closeDialog={closeAbout}/>
    {/if}
</main>
    
<script lang='ts'>
    import { getSliderVal, ImgParams } from './model/ImgParams';
    import ImgParamsMenu from './ImgParamsMenu.svelte';
    import { onDestroy, onMount } from 'svelte';
    import Icon from './Icon.svelte';
    import { drawRandomScene, drawScene } from './draw/drawScene';
    import { setTaskExecutorListeners, submitTask, submitTaskFast } from './util/submitTask';
    import About from './About.svelte';
    import { fitViewRatio } from './model/ratios';

    let codeCanvasEl: HTMLCanvasElement;
    let alphabetCanvasEl: HTMLCanvasElement;
    let attributionCanvasEl: HTMLCanvasElement;
    let selfAttrCanvasEl: HTMLCanvasElement;

    let progress = false;
    setTaskExecutorListeners({
        onStart: () => progress = true,
        onEnd: () => progress = false,
    });

    let imgParams: ImgParams | undefined = undefined;

    let openDialog: 'menu' | 'about' | undefined = undefined;
    function handleImgParamsClick() {
        if (openDialog === 'menu') {
            openDialog = undefined;
        } else {
            openDialog = 'menu';
        }
    }

    function closeImgParams() {
        if (openDialog === 'menu') {
            openDialog = undefined;
        }
    }

    function handleAboutClick() {
        openDialog = 'about';
    }

    function closeAbout() {
        if (openDialog === 'about') {
            openDialog = undefined;
        }
    }

    // In Safari sizes may be not ready on mount, that's why raf
    onMount(() => requestAnimationFrame(async () => await generateScene()));

    let generateRotateDeg = 0;
    async function handleGenerateClick() {
        if (imgParams) {
            generateRotateDeg += 360;
            await generateScene();
        }
    }

    async function generateScene() {
        submitTaskFast(async () =>
            await drawRandomScene(
                imgParams,
                codeCanvasEl,
                alphabetCanvasEl,
                attributionCanvasEl,
                selfAttrCanvasEl,
                p => imgParams = p,
            )
        );
    }

    async function onParamsUpdate(_, updatedSize: boolean) {
        submitTask(async () => {
            if (imgParams) {
                updateCodeWrSizeStyle();
                await drawScene(
                    imgParams,
                    codeCanvasEl,
                    alphabetCanvasEl,
                    attributionCanvasEl,
                    selfAttrCanvasEl,
                    updatedSize,
                    triggerImgParamsUpdate,
                );
            }
        });
    }

    onMount(() => window.addEventListener('resize', resizeListener));
    onDestroy(() => window.removeEventListener('resize', resizeListener));
    async function resizeListener() {
        submitTask(async () => {
            if (imgParams) {
                await drawScene(
                    imgParams,
                    codeCanvasEl,
                    alphabetCanvasEl,
                    attributionCanvasEl,
                    selfAttrCanvasEl,
                    true,
                    triggerImgParamsUpdate,
                );
            }
        });
    }

    function triggerImgParamsUpdate() {
        imgParams = imgParams;
    }

    let codeWrModifier: 'fit' | 'aspect' = 'fit';
    let codeWrStyle: string | undefined = undefined;
    function updateCodeWrSizeStyle() {
        if (imgParams) {
            const r = imgParams['output image'].ratio.val;
            codeWrModifier = r === fitViewRatio ? 'fit' : 'aspect';

            const s = getSliderVal(imgParams['output image'].size) * 100;
            codeWrStyle = `--h: ${s}vh; --w: ${s}vw; `;
            if (r !== fitViewRatio) {
                codeWrStyle += `--a: calc(${r});`;
            }
        }
    }

    let downloading = false;
    function handleDownloadClick() {
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
</script>
