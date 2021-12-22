<script lang='ts'>
    import { Router, Route } from 'svelte-routing';
    import Code from './Code.svelte';
</script>

<style>
    main {
        text-align: center;
        margin: 0 auto;
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
