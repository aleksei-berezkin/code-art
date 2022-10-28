<style>
    main {
        /* We can't use vh in mobile browsers because it may result in vertical scroll */
        /* So we introduce like 'container-height' properties */
        --main-h: 100%;
        --main-w: 100%;

        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        margin: 0;
        padding: 0;
        width: 100%;
    }

    .alphabet-canvas, .attribution-canvas, .self-attr-canvas {
        left: 0;
        position: absolute;
        transform: translateY(-150%);
        top: 0;
    }

    .code-canvas {
        --s: 1;
        --outline-h: calc(var(--main-h) * var(--s));
        --outline-w: calc(var(--main-w) * var(--s));

        background-color: #707688;
    }

    .code-canvas.fit {
        height: var(--outline-h);
        width: var(--outline-w);
    }

    .code-canvas.aspect {
        --a: calc(1 / 1);

        height: calc(min(var(--outline-h), var(--outline-w) / var(--a)));
        width: calc(min(var(--outline-w), var(--outline-h) * var(--a)));
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

<main bind:this={mainEl}>
    <canvas class='alphabet-canvas' bind:this={alphabetCanvasEl} width='2048'></canvas>
    <canvas class='attribution-canvas' bind:this={attributionCanvasEl}></canvas>
    <canvas class='self-attr-canvas' bind:this={selfAttrCanvasEl}></canvas>

    <canvas class={`code-canvas ${codeCanvasModifier}`} bind:this={codeCanvasEl}></canvas>

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
    import { fitViewRatio, getFractionFromDisplayedRatio } from './model/ratios';
    import { delayToAnimationFrame } from './util/delay';
    import { dpr } from './util/dpr';

    let mainEl: HTMLElement;
    onMount(() => {
        setMainSizeVars();
        window.addEventListener('resize', setMainSizeVars);
    });
    onDestroy(() => window.removeEventListener('resize', setMainSizeVars));
    function setMainSizeVars() {
        const rect = mainEl.getBoundingClientRect();
        mainEl.style.setProperty('--main-h', `${rect.height}px`);
        mainEl.style.setProperty('--main-w', `${rect.width}px`);
    }

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
    onMount(async () => {
        await setCodeCanvasWH();
        await generateScene();
    });

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
                if (updatedSize) {
                    updateCodeCanvasStyle();
                    await setCodeCanvasWH();
                }
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

    onMount(() => window.addEventListener('resize', drawOnResize));
    onDestroy(() => window.removeEventListener('resize', drawOnResize));
    async function drawOnResize() {
        submitTask(async () => {
            if (imgParams) {
                updateCodeCanvasStyle();
                await setCodeCanvasWH();
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

    let codeCanvasModifier: 'fit' | 'aspect' = 'fit';
    function updateCodeCanvasStyle() {
        if (imgParams) {
            const r = imgParams['output image'].ratio.val;
            codeCanvasModifier = r === fitViewRatio ? 'fit' : 'aspect';

            const sizeFr = getSliderVal(imgParams['output image'].size);
            codeCanvasEl.style.setProperty('--s', String(sizeFr));

            if (r !== fitViewRatio) {
                codeCanvasEl.style.setProperty('--a', `calc(${getFractionFromDisplayedRatio(r)})`);
            }
        }
    }

    async function setCodeCanvasWH() {
        await delayToAnimationFrame(); // Make sure layout happened
        const canvasRect = codeCanvasEl.getBoundingClientRect();
        codeCanvasEl.width = canvasRect.width * dpr;
        codeCanvasEl.height = canvasRect.height * dpr;
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
