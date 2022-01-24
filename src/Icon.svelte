<!--suppress CssNonIntegerLengthInPixels, CssUnusedSymbol -->
<style>
    .ic {
        fill: #000000d0;
        stroke: none;
        transition: transform var(--ic-tx) ease-out;
    }

    .ic.std {
        height: var(--ic-size-std);
        width: var(--ic-size-std);
    }

    .ic.inl.arrow-down {
        height: 7.41px;
        width: 12px;
    }

    .ic.scale-to-0 {
        transform: scale(0);
    }
</style>

<svg xmlns='http://www.w3.org/2000/svg'
     class={`ic ${size} ${pic ?? ''} ${scaleTo0 ? 'scale-to-0' : '' }`}
     viewBox={size === 'inl' ? inlineViewBoxes[pic] : '0 0 24 24'}
     style={ rotateDeg ? `transform: rotate(${rotateDeg}deg)` : undefined}
     bind:this={svgEl}>
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
</svg>

<script lang='ts'>
    import { parseMs } from './util/parseMs';

    type Pic = 'arrow-down' | 'close' | 'download' | 'downloading' | 'menu' | 'pending' | 'reload' | undefined;

    export let pic: Pic = undefined;
    export let size: 'std' | 'inl' = 'std';
    export let rotateDeg: number = 0;

    // Crop svg to content: https://svgcrop.com/
    const inlineViewBoxes = {
        'arrow-down': '6 8.59 12 7.41',
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
