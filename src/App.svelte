<script lang='ts'>
    import { Router, Route } from 'svelte-routing';
    import Code from './Code.svelte';
    import About from './About.svelte';
</script>

<style>
    :global(body) {
        color: #333;
        font-family: Roboto, sans-serif;
        font-size: 16px;
        margin: 0;
        padding: 0;

        --bord-r-std: 8px;
        --btn-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
        --btn-size: 48px;
        --ic-tx: 200ms;
        --link-tx: 300ms;
        --menu-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%);
        --pad-std: 16px;
    }

    :global(button) {
        background: unset;
        border: unset;
        color: inherit;
        cursor: pointer;
        font: unset;
        margin: 0;
        padding: 0;
    }
</style>

<main>
    <Router url=''>
        <Route path='/' component={ Code } />
        <Route path='/about' component={ About } />
    </Router>
</main>
