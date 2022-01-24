<style>
    .ic {
        fill: #000000d0;
        stroke: none;
        transition: transform var(--tr-fast) ease-out;
        vertical-align: bottom;
    }

    .ic.std {
        height: var(--ic-std-size);
        width: var(--ic-std-size);
    }

    .ic.sm {
        height: var(--ic-sm-size);
        width: var(--ic-sm-size);
    }

    .ic.scale-to-0 {
        transform: scale(0);
    }
</style>

<svg xmlns='http://www.w3.org/2000/svg'
     viewBox='4 4 16 16'
     class={`ic ${size} ${scaleTo0 ? 'scale-to-0' : '' }`}
     style={ rotateDeg ? `transform: rotate(${rotateDeg}deg)` : undefined}
     bind:this={svgEl}>
    {#if p === 'arrow down'}
        <path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z'/>
    {/if}
    {#if p === 'download'}
        <path d='M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z'/>
    {/if}
    {#if p === 'close'}
        <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/>
    {/if}
    {#if p === 'menu'}
        <path d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'/>
    {/if}
    {#if p === 'reload'}
        <path d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/>
    {/if}
</svg>

<script lang='ts'>
    import { parseMs } from './util/parseMs';

    type Pic = 'arrow down' | 'close' | 'download' | 'menu' | 'reload' | undefined;
    export let pic: Pic = undefined;
    export let size: 'std' | 'sm' = 'std';
    export let rotateDeg: number = 0;

    let svgEl: HTMLElement;
    let p: Pic = pic;
    let scaleTo0 = false;
    $: {
        if (p !== pic) {
            const delayMs = parseMs(getComputedStyle(svgEl).getPropertyValue('--tr-fast'));
            scaleTo0 = true;
            setTimeout(() => {
                p = pic;
                scaleTo0 = false;
            }, delayMs / 3)
        }
    }
</script>
