<style>
    .contacts {
        display: flex;
    }

    .contacts.light {
        --c: #0006;
        --C: #0009;
    }

    .contacts.dark {
        --c: #00000098;
        --C: #000e;
    }

    .link {
        display: block;
        text-decoration: none;
        transition: color var(--link-tx);
    }

    .link:not(:last-child) {
        margin-right: .4em;
    }

    .link, .link:visited {
        color: var(--c);
    }

    .link:hover {
        color: var(--C);
    }
</style>

<section role='contentinfo' class={`contacts ${color}`}>
    {#each Object.entries(contacts) as [pic, url]}
        <a href={url} target='_blank' class='link'>
            <Icon pic={pic} size={size}/>
        </a>
    {/each}
</section>

<script lang='ts'>
    import Icon from './Icon.svelte';
    import type { IconSize } from './IconSize';

    export let size: IconSize;
    export let color: 'light' | 'dark';

    const contacts = {
        github: 'https://github.com/aleksei-berezkin/code-art',
        'linked-in': 'https://www.linkedin.com/in/a-v-berezkin',
        facebook: 'https://www.facebook.com/people/Alexey-Berezkin/100005955309004',
        twitter: 'https://twitter.com/a_v_berezkin',
        dev: 'https://dev.to/alekseiberezkin',
    };
</script>
