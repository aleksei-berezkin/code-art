<script lang='ts'>
    import { Router, Route } from 'svelte-routing';
    import Code from './Code.svelte';
</script>

<style>
    :global(body) {
        color: #333;
        font-family: Roboto, sans-serif;
        margin: 0;
        padding: 8px;

        --bord-r-std: 8px;
        --btn-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
        --btn-size: 48px;
        --ic-size-std: 32px;
        --ic-tx: 200ms;
        --menu-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%);
        --pad-std: 16px;
    }

    main {
        margin: 0;
    }

    footer {
        text-align: center;
    }
</style>

<main>
    <Router url=''>
        <Route path='/' component={ Code } />
    </Router>
</main>

<footer>
    <a href='https://github.com/aleksei-berezkin/code-art/'>GitHub</a>
</footer>
