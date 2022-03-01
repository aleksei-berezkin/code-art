<!--suppress CssNonIntegerLengthInPixels -->
<style>
    .menu-root {
        background-color: #ffffffc0;
        border-radius: var(--bord-r-std);
        box-sizing: border-box;
        box-shadow: var(--menu-shadow);
        left: var(--pad-std);
        margin: 0;
        max-height: calc(var(--main-h) - 3 * var(--pad-std) - var(--btn-size));
        overflow-y: scroll;
        padding-top: var(--pad-std);
        position: absolute;
        transform: scale(0);
        transform-origin: top left;
        transition: transform var(--ic-tx), opacity var(--ic-tx);
        top: calc(var(--pad-std) * 2 + var(--btn-size));

        --pad-gr: calc(var(--pad-std) *.75);
    }

    .menu-root.open {
        transform: scale(1);
        opacity: 1;
    }

    .group {
        padding-bottom: var(--pad-gr);
        padding-left: var(--pad-std);
        padding-right: var(--pad-std);
    }

    .group-button:active {
        color: unset;
    }

    .group-button-txt {
        padding-left: .5em;
        padding-right: 1em;
    }

    .group-body {
        --label-w: 2.5rem;
        --input-w: 12rem;

        display: grid;
        gap: calc(var(--pad-gr) * .75);
        grid-template-columns: auto var(--label-w) var(--input-w) var(--label-w);
        height: 0;
        opacity: 0;
        padding-left: calc(1.6em);
        font-size: .9em;
        transform: scale(0);
        transform-origin: top left;
        transition: transform var(--ic-tx);
    }

    .group-body.open {
        height: auto;
        opacity: 1;
        padding-top: var(--pad-gr);
        transform: scale(1);
    }

    .param-label-wr {
        align-items: center;
        display: flex;
    }

    .param-min {
        text-align: right;
    }

    .input-slider {
        margin: 0;
        width: 100%;
    }

    .input-select {
        font: inherit;
        padding: 0.25em;
        width: 100%;
    }

    @media (max-width: 510px) {
        .menu-root {
            max-width: calc(100vw - 2 * var(--pad-std));
        }

        .group-body {
            grid-template-columns: auto minmax(auto, var(--input-w));
        }

        .param-min, .param-max {
            display: none;
        }
    }

    .footer-group {
        align-items: center;
        display: flex;
        flex-direction: column;
        padding-bottom: var(--pad-std);
    }

    .footer-about {
        color: var(--link-c);
        letter-spacing: .04em;
        margin-top: calc(var(--pad-gr) * .7);
        transition: color var(--link-tx);
    }

    .footer-about:hover {
        color: var(--link-c-h);
    }
</style>

<aside class={`menu-root ${menuOpen ? 'open' : ''}`} aria-label='Image params' bind:this={menuRootEl}>
    <div>
    {#each Object.entries(imgParams) as [g, ps]}
        <div class='group' role='region' aria-label={`Controls group: ${g}`}>
            <button class='group-button' aria-label={`Toggle group visibility: ${g}`} data-g={g} on:click={handleToggleGroup}>
                <Icon pic='arrow-down' size='sm' rotateDeg={openGroups.includes(g) ? -180 : 0}/>
                <span class='group-button-txt'>{g}</span>
            </button>

            <div class={`group-body ${openGroups.includes(g) ? 'open' : ''}`}>
                {#each Object.entries(ps) as [k, p]}
                    <div class='param-label-wr'>
                        <label for={toId(g, k)}>{k}</label>
                    </div>

                    <div class='param-min'>{p.type === 'slider' ? getSliderLabel(p, 'min') : undefined}</div>

                    {#if p.type === 'slider'}
                        <!--suppress XmlDuplicatedId -->
                        <input class='input-slider' id={toId(g, k)}
                               data-g={g} data-k={k}
                               type='range' min='{p.min}' max='{p.max}' step='any'
                               value='{p.val}'
                               on:input={handleSliderChange}
                               title="{getSliderLabel(p, 'val')}"
                        />
                    {/if}

                    {#if p.type === 'choices'}
                        <!--suppress XmlDuplicatedId -->
                        <select class='input-select' id={toId(g, k)} data-g={g} data-k={k} on:change={handleChoiceChange}>
                            {#each p.choices as choice}
                                {#if p.val === choice}
                                    <option value={choice} selected>{choice}</option>
                                {:else}
                                    <option value={choice}>{choice}</option>
                                {/if}
                            {/each}
                        </select>
                    {/if}

                    {#if p.type === 'color'}
                        <!--suppress XmlDuplicatedId -->
                        <input id={toId(g, k)} data-g={g} data-k={k} type='color' value='{p.val}' on:change={handleColorChange}/>
                    {/if}

                    <div class='param-max'>{p.type === 'slider' ? getSliderLabel(p, 'max') : undefined}</div>
                {/each}
            </div>
        </div>
    {/each}
    </div>
    <div class='footer-group'>
        <Contacts size='sm' color='light'/>
        <button class='footer-about' on:click={clickedAbout}>about</button>
    </div>
</aside>

<script lang='ts'>
    import { getSliderLabel, ImgParams, ParamGroup } from './model/ImgParams';
    import { afterUpdate, onDestroy } from 'svelte';
    import Icon from './Icon.svelte';
    import { getFromSelfOrParentDataset } from './util/getFromSelfOrParentDataset';
    import Contacts from './Contacts.svelte';
    import { createCloseBehavior } from './util/createCloseBehavior';
    import { noAttribution } from './model/attributionPos';
    import { sourceSpecs } from './model/sourceSpecs';

    export let imgParams: ImgParams;
    export let menuOpen: boolean;
    export let paramsUpdated: (params: ImgParams, updatedSize: boolean) => void;
    export let closeMenu: () => void;
    export let clickedAbout: () => void;

    function toId(g: string, k: string) {
        return `img-param__${[g, k].map(s => s.replace(/\s/g, '_')).join('__')}`;
    }

    let openGroups: ParamGroup[] = [];

    function handleToggleGroup(e: MouseEvent) {
        const g = getFromSelfOrParentDataset(e.target as HTMLElement, 'g') as ParamGroup;
        if (openGroups.includes(g)) {
            openGroups = openGroups.filter(_g => _g !== g);
        } else {
            openGroups = [g, ...openGroups];
        }
    }

    let menuRootEl: HTMLElement;
    const closeBehavior = createCloseBehavior();

    afterUpdate(() => {
        if (menuOpen && !closeBehavior.isAttached()) {
            closeBehavior.attachDeferred(menuRootEl, closeMenu);
        } else if (!menuOpen) {
            closeBehavior.detach();
        }
    });

    onDestroy(closeBehavior.detach);

    function handleSliderChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const g = inputEl.dataset.g;
        const k = inputEl.dataset.k;
        imgParams[g][k].val = Number(inputEl.value);
        paramsUpdated(imgParams, isUpdatedSize(g, k));
    }

    function handleChoiceChange(e: Event) {
        const selectEl = (e.target as HTMLSelectElement);
        const g = selectEl.dataset.g;
        const k = selectEl.dataset.k;
        if (g === 'output image' && k === 'attribution'
            && imgParams[g][k].choices[selectEl.selectedIndex] === noAttribution) {
            alert('Please make sure to give attribution both to code-art.pictures and to '
                + sourceSpecs[imgParams.source.source.val].credit
            );
        }
        imgParams[g][k].val = imgParams[g][k].choices[selectEl.selectedIndex];
        paramsUpdated(imgParams, isUpdatedSize(g, k));
    }

    function isUpdatedSize(g: string, k: string) {
        return imgParams[g][k] === imgParams['output image'].ratio
            || imgParams[g][k] === imgParams['output image'].size
    }
    function handleColorChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const g = inputEl.dataset.g;
        const k = inputEl.dataset.k;
        imgParams[g][k].val = inputEl.value;
        paramsUpdated(imgParams, false);
    }
</script>
