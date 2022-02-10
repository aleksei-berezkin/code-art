<style>
    .contacts {
        display: flex;
    }

    .link {
        display: block;
        opacity: .5;
        text-decoration: none;
        transition: opacity var(--t-link);
    }

    .link:not(:last-child) {
        margin-right: .4em;
    }

    .link:hover {
        opacity: .8;
    }
</style>

<section role='contentinfo' class='contacts'>
    {#each Object.entries(contacts) as [pic, url]}
        <a href={url} target='_blank' class='link'>
            <Icon pic={pic} size={size} col='dark'/>
        </a>
    {/each}
</section>

<script lang='ts'>
    import Icon from './Icon.svelte';
    import type { IconSize } from './IconSize';

    export let size: IconSize;

    const contacts = {
        github: 'https://github.com/aleksei-berezkin/code-art',
        'linked-in': 'https://www.linkedin.com/in/a-v-berezkin',
        facebook: 'https://www.facebook.com/people/Alexey-Berezkin/100005955309004',
        twitter: 'https://twitter.com/a_v_berezkin',
        dev: 'https://dev.to/alekseiberezkin',
    };
</script>
