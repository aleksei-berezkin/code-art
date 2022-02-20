<script lang='ts'>
    import Code from './Code.svelte';
</script>

<style>
    :global(html) {
        background-color: #384048;
        color: #333;
        font-family: Roboto, sans-serif;
        font-size: 16px;

        --bord-r-std: 8px;
        --btn-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
        --btn-size: 48px;
        --ic-tx: 200ms;
        --link-c: #00000088;
        --link-c-h: #000c;
        --link-tx: 300ms;
        --menu-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%);
        --pad-std: 16px;
    }

    :global(html, body) {
        height: 100%;
        margin: 0;
        padding: 0;
        width: 100%;
    }

    :global(a, a:visited) {
        color: var(--link-c);
        font-family: unset;
        text-decoration: none;
    }

    :global(a:hover) {
        color: var(--link-c-h);
        text-decoration: underline;
    }

    :global(button) {
        background: unset;
        border: unset;
        color: inherit;
        cursor: pointer;
        font: unset;
        margin: 0;
        padding: 0;
        text-align: left;
    }
</style>

<Code/>
