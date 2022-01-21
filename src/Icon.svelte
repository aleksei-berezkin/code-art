<style>
    .ic {
        fill: #000000d0;
        height: var(--btn-pic-size);
        stroke: none;
        transition: transform var(--tr-std);
        width: var(--btn-pic-size);
    }

    .ic.rotate180 {
        transform: rotate(-180deg);
    }
</style>

<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' class={`ic ${rotate ? 'rotate180' : ''}`}>
    {#if pic === 'arrow down'}
        <path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z'/>
    {/if}
    {#if pic === 'reload'}
        <path d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/>
    {/if}
    {#if pic === 'download'}
        <path d='M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z'/>
    {/if}
</svg>

<script lang='ts'>
    export let pic: 'arrow down' | 'reload' | 'download';
    export let rotate: boolean = false;
</script>
