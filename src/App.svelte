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
