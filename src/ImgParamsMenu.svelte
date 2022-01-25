<!--suppress CssNonIntegerLengthInPixels -->
<style>
    .menu-root {
        background-color: #ffffffb0;
        border-radius: var(--bord-r-std);
        box-sizing: border-box;
        box-shadow: var(--menu-shadow);
        left: var(--pad-std);
        margin: 0;
        opacity: 0;
        padding: var(--pad-std);
        position: absolute;
        transform: scale(0);
        transform-origin: top left;
        transition: transform var(--ic-tx), opacity var(--ic-tx);
        top: calc(var(--pad-std) * 2 + var(--btn-size));

        --pad-gr: calc(var(--pad-std) *.75);
        --input-w: 12rem;
        --label-p: .75rem;
        --label-w: 2.5rem;
    }

    .menu-root.open {
        transform: scale(1);
        opacity: 1;
    }

    .group:not(:last-child) {
        padding-bottom: var(--pad-gr);
    }

    .group-button {
        background: none;
        border: none;
        cursor: pointer;
        font: inherit;
        margin: 0;
        padding: 0;
    }

    .group-button:active {
        color: unset;
    }

    .group-button-txt {
        padding-left: .5em;
        padding-right: var(--input-w);
    }

    .group-body {
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
        transform: scale(1);
    }

    .slider-wr {
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-top: calc(var(--pad-gr) * .75);
    }

    .slider-label {
        flex-grow: 1;
    }

    .slider-min {
        padding-right: var(--label-p);
        text-align: right;
        width: var(--label-w);
    }

    .slider-slider {
        margin: 0;
        max-width: 50vw;
        width: var(--input-w);
    }

    .slider-max {
        padding-left: var(--label-p);
        width: var(--label-w);
    }

    .choices-wr {
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-top: calc(var(--pad-gr) * .25);
    }

    .choices-select {
        font: inherit;
        margin-right: calc(var(--label-w) + var(--label-p));
        padding: 0.25em;
        width: var(--input-w);
    }

    .input-color-wr {
        padding-top: calc(var(--pad-gr) * .3);
        width: calc(var(--input-w) + var(--label-w) + var(--label-p));
    }
</style>

<menu class={`menu-root ${menuOpen ? 'open' : ''}`} bind:this={menuRootEl}>
    {#each Object.entries(imgParams) as [g, ps]}
        <div class='group'>
            <button class='group-button' aria-label={`Toggle group: ${g}`} data-g={g} on:click={handleToggleGroup}>
                <Icon pic='arrow-down' size='inl' rotateDeg={openGroups.includes(g) ? -180 : 0}/>
                <span class='group-button-txt'>{g}</span>
            </button>

            <div class={`group-body ${openGroups.includes(g) ? 'open' : ''}`}>
                {#each Object.entries(ps) as [k, p]}
                    {#if p.type === 'slider'}
                        <div class='slider-wr'>
                            <label class='slider-label' for={toId(k)}>{k}</label>
                            <div class='slider-min'>{getSliderLabel(p, 'min')}</div>
                            <!--suppress XmlDuplicatedId -->
                            <input class='slider-slider' id={toId(k)}
                                   data-g={g} data-k={k}
                                   type='range' min='{p.min}' max='{p.max}' step='any'
                                   value='{p.val}'
                                   on:input={handleSliderChange}
                                   title="{getSliderLabel(p, 'val')}"
                            />
                            <div class='slider-max'>{getSliderLabel(p, 'max')}</div>
                        </div>
                    {/if}
            
                    {#if p.type === 'choices'}
                        <div class='choices-wr'>
                            <label class='choices-label' for={toId(k)}>{k}</label>
                            <!--suppress XmlDuplicatedId -->
                            <select class='choices-select' id={toId(k)} data-g={g} data-k={k} on:change={handleChoiceChange}>
                                {#each p.choices as choice}
                                    {#if p.val === choice}
                                        <option value={choice} selected>{choice}</option>
                                    {:else}
                                        <option value={choice}>{choice}</option>
                                    {/if}
                                {/each}
                            </select>
                        </div>
                    {/if}
            
                    {#if p.type === 'color'}
                        <div class='choices-wr'>
                            <label for={toId(k)}>{k}</label>
                            <div class='input-color-wr'>
                                <!--suppress XmlDuplicatedId -->
                                <input id={toId(k)} data-g={g} data-k={k} type='color' class='input-color' value='{p.val}' on:change={handleColorChange}/>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    {/each}
</menu>

<script lang='ts'>
    import { getSliderLabel, getSliderVal, ImgParams, ParamGroup } from './model/ImgParams';
    import { afterUpdate, onDestroy } from 'svelte';
    import Icon from './Icon.svelte';
    import { getFromSelfOrParentDataset } from './util/getFromSelfOrParentDataset';

    export let imgParams: ImgParams;
    export let menuOpen: boolean;
    export let paramsUpdated: (imgParams: ImgParams) => void;
    export let clickedOutside: () => void;

    function toId(k: string) {
        return 'code-scene-control-' + k.replace(/\s/g, '-');
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
    let outsideClickListener: ((e: MouseEvent) => void) | undefined = undefined;

    afterUpdate(async () => {
        if (!menuOpen) {
            removeOutsideClickListener();
            return;
        }

        // Event is still processed, so postpone
        setTimeout(() => {
            if (outsideClickListener) {
                window.removeEventListener('click', outsideClickListener);
            }
    
            outsideClickListener = function (e: MouseEvent) {
                if ((e.target as Node | null)?.nodeType && menuRootEl.contains(e.target as Node)) {
                    return;
                }
    
                clickedOutside();
            }
    
            window.addEventListener('click', outsideClickListener);
        });
    });

    onDestroy(removeOutsideClickListener);

    function removeOutsideClickListener() {
        if (outsideClickListener) {
            window.removeEventListener('click', outsideClickListener);
        }
    }

    function handleSliderChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const g = inputEl.dataset.g;
        const k = inputEl.dataset.k;
        imgParams[g][k].val = Number(inputEl.value);
        paramsUpdated(imgParams);
    }

    function handleChoiceChange(e: Event) {
        const selectEl = (e.target as HTMLSelectElement);
        const g = selectEl.dataset.g;
        const k = selectEl.dataset.k;
        imgParams[g][k].val = imgParams[g][k].choices[selectEl.selectedIndex];
        paramsUpdated(imgParams);
    }

    function handleColorChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const g = inputEl.dataset.g;
        const k = inputEl.dataset.k;
        imgParams[g][k].val = inputEl.value;
        paramsUpdated(imgParams);
    }
</script>
