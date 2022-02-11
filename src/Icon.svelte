<!--suppress CssNonIntegerLengthInPixels, CssUnusedSymbol -->
<style>
    .ic {
        --ic-h-sm: 20px;
        --ic-f-md: 1.2;
        --ic-f-lg: 1.6;

        fill: #000d;
        stroke: none;
        transition: transform var(--ic-tx) ease-out;
        vertical-align: bottom;
    }

    .ic.arrow-down {
        --ic-h-sm: 7.41px;
        vertical-align: baseline;
    }

    .ic.sm {
        height: var(--ic-h-sm);
    }

    .ic.md {
        height: calc(var(--ic-h-sm) * var(--ic-f-md));
    }

    .ic.lg {
        height: calc(var(--ic-h-sm) * var(--ic-f-lg));
    }


    .ic:not(.arrow-down) {
        vertical-align: bottom;
    }

    .ic.arrow-down {
        vertical-align: baseline;
    }

    .ic.sm.arrow-down {
        height: 7.41px;
        width: 12px;
    }

    .ic.scale-to-0 {
        transform: scale(0);
    }
</style>

<svg xmlns='http://www.w3.org/2000/svg'
     class={`ic ${pic} ${size} ${scaleTo0 ? 'scale-to-0' : '' }`}
     viewBox={viewBoxes[pic] ?? '0 0 24 24'}
     style={ rotateDeg ? `transform: rotate(${rotateDeg}deg)` : undefined}
     bind:this={svgEl}>
    <title>{p}</title>
    {#if p === 'arrow-down'}
        <path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z'/>
    {/if}
    {#if p === 'download'}
        <path d='M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z'/>
    {/if}
    {#if p === 'downloading'}
        <path d='M18.32,4.26C16.84,3.05,15.01,2.25,13,2.05v2.02c1.46,0.18,2.79,0.76,3.9,1.62L18.32,4.26z M19.93,11h2.02 c-0.2-2.01-1-3.84-2.21-5.32L18.31,7.1C19.17,8.21,19.75,9.54,19.93,11z M18.31,16.9l1.43,1.43c1.21-1.48,2.01-3.32,2.21-5.32 h-2.02C19.75,14.46,19.17,15.79,18.31,16.9z M13,19.93v2.02c2.01-0.2,3.84-1,5.32-2.21l-1.43-1.43 C15.79,19.17,14.46,19.75,13,19.93z M15.59,10.59L13,13.17V7h-2v6.17l-2.59-2.59L7,12l5,5l5-5L15.59,10.59z M11,19.93v2.02 c-5.05-0.5-9-4.76-9-9.95s3.95-9.45,9-9.95v2.02C7.05,4.56,4,7.92,4,12S7.05,19.44,11,19.93z'/>
    {/if}
    {#if p === 'close'}
        <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/>
    {/if}
    {#if p === 'menu'}
        <path d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'/>
    {/if}
    {#if p ==='pending'}
        <path d='M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M12,20c-4.42,0-8-3.58-8-8 c0-4.42,3.58-8,8-8s8,3.58,8,8C20,16.42,16.42,20,12,20z'/>
        <circle cx='7' cy='12' r='1.5'/>
        <circle cx='12' cy='12' r='1.5'/>
        <circle cx='17' cy='12' r='1.5'/>
    {/if}
    {#if p === 'reload'}
        <path d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/>
    {/if}
    {#if p === 'github'}
        <path d='M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3'/>
    {/if}
    {#if p === 'dev'}
<!--        https://worldvectorlogo.com/ru/logo/devto-->
        <path d='M120.12 208.29c-3.88-2.9-7.77-4.35-11.65-4.35H91.03v104.47h17.45c3.88 0 7.77-1.45 11.65-4.35s5.82-7.25 5.82-13.06v-69.65c-.01-5.8-1.96-10.16-5.83-13.06zM404.1 32H43.9C19.7 32 .06 51.59 0 75.8v360.4C.06 460.41 19.7 480 43.9 480h360.2c24.21 0 43.84-19.59 43.9-43.8V75.8c-.06-24.21-19.7-43.8-43.9-43.8zM154.2 291.19c0 18.81-11.61 47.31-48.36 47.25h-46.4V172.98h47.38c35.44 0 47.36 28.46 47.37 47.28zm100.68-88.66H201.6v38.42h32.57v29.57H201.6v38.41h53.29v29.57h-62.18c-11.16.29-20.44-8.53-20.72-19.69V193.7c-.27-11.15 8.56-20.41 19.71-20.69h63.19zm103.64 115.29c-13.2 30.75-36.85 24.63-47.44 0l-38.53-144.8h32.57l29.71 113.72 29.57-113.72h32.58z'/>
    {/if}
    {#if p === 'linked-in'}
        <path d='M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z'/>
    {/if}
    {#if p === 'facebook'}
        <path d='M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m13 2h-2.5A3.5 3.5 0 0 0 12 8.5V11h-2v3h2v7h3v-7h3v-3h-3V9a1 1 0 0 1 1-1h2V5z'/>
    {/if}
    {#if p === 'twitter'}
        <path d='M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z'/>
    {/if}
</svg>

<script lang='ts'>
    import { parseMs } from './util/parseMs';
    import type { IconSize } from './IconSize';

    type Pic = 'arrow-down' | 'close' | 'download' | 'downloading' | 'menu' | 'pending' | 'reload' | 'github' | 'dev' | 'linked-in' | 'facebook' | 'twitter' | undefined;

    export let pic: Pic = undefined;
    export let size: IconSize = 'lg';
    export let rotateDeg: number = 0;

    const viewBoxes = {
        // Crop svg to content: https://svgcrop.com/
        'arrow-down': '6 8.59 12 7.41',
        dev: '0 32 448 448',
    };

    let svgEl: HTMLElement;
    let p: Pic = pic;
    let scaleTo0 = false;
    $: {
        if (svgEl && p !== pic) {
            const delayMs = parseMs(getComputedStyle(svgEl).getPropertyValue('--ic-tx'));
            scaleTo0 = true;
            setTimeout(() => {
                p = pic;
                scaleTo0 = false;
            }, delayMs / 3)
        }
    }
</script>
