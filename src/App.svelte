<script lang='ts'>
    import CodeCanvas from './CodeCanvas.svelte';
</script>

<style>
    header {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
        text-align: center;
    }

    main {
        text-align: center;
        margin: 0 auto;
    }

    footer {
        text-align: center;
    }
</style>

<header>Code Art</header>

<main>
    <CodeCanvas/>
</main>

<footer>
    <a href='https://github.com/aleksei-berezkin/code-art/'>GitHub</a>
</footer>
