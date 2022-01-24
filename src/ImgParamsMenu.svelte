<style>
    .menu-root {
        background-color: #ffffffb0;
        border-radius: var(--bord-r-std);
        box-sizing: border-box;
        box-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%);
        left: var(--pad-std);
        margin: 0;
        opacity: 0;
        padding: var(--pad-std);
        position: absolute;
        transform: scale(0);
        transform-origin: top left;
        transition: transform var(--tr-fast), opacity var(--tr-fast);
        top: calc(var(--pad-std) * 2 + var(--btn-size));
    }

    .menu-root.open {
        transform: scale(1);
        opacity: 1;
    }

    .group:not(:last-child) {
        padding-bottom: calc(var(--pad-std) / 2);
    }

    .group-button {
        background: none;
        border: none;
        cursor: pointer;
        font: inherit;
        margin: 0;
        padding: 0;
    }

    .group-button-txt {
        padding-left: .5em;
    }

    .group-body {
        height: 0;
        opacity: 0;
        padding-top: calc(var(--pad-std) / 2);
        padding-left: calc(var(--pad-std) * .75);
        font-size: .9em;
        transform: scale(0);
        transform-origin: top left;
        transition: all var(--tr-fast);
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
        margin-bottom: .5em;
    }

    .slider-label {
        flex-grow: 1;
        text-align: left;
    }

    .slider-min {
        padding-right: 1em;
        text-align: right;
        width: 4em;
    }

    .slider-slider {
        margin: 0;
        max-width: 50vw;
        padding: 0;
        width: 240px;
    }

    .slider-max {
        width: 4em;
        text-align: right;
    }

    .choices-wr {
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: .5em;
    }

    .choices-select {
        font: inherit;
        margin: 0 4em 0.5em 0;
        padding: 0.4em;
        width: 240px;
    }

    .input-color-wr {
        width: calc(240px + 4em);
        text-align: left;
    }
</style>

<menu class={`menu-root ${menuOpen ? 'open' : ''}`} bind:this={menuRootEl}>
    {#each Object.entries(imgParams) as [g, ps]}
        <div class='group'>
            <button class='group-button' aria-label={`Toggle group: ${g}`} data-g={g} on:click={handleToggleGroup}>
                <Icon pic='arrow down' size='sm' rotateDeg={openGroups.includes(g) ? -180 : 0}/> <span class='group-button-txt'>{g}</span>
            </button>

            <div class={`group-body ${openGroups.includes(g) ? 'open' : ''}`}>
                {#each Object.entries(ps) as [k, p]}
                    {#if p.type === 'slider'}
                        <div class='slider-wr'>
                            <label class='slider-label' for={toId(k)}>{k}</label>
                            <div class='slider-min'>{toLabelNum(p, 'min')}</div>
                            <!--suppress XmlDuplicatedId -->
                            <input class='slider-slider' id={toId(k)} data-g={g} data-k={k} type='range' min='{p.min}' max='{p.max}' step='any' value='{p.val}' on:input={handleSliderChange}/>
                            <div class='slider-max'>{toLabelNum(p, 'max')}</div>
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
    import { ImgParams, ParamGroup, SliderVal } from './ImgParams';
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

    function toLabelNum(p: SliderVal, which: 'min' | 'max') {
        const val = p[which];
        let s;
        if (p.unit === 'rad') {
            s = `${val / Math.PI * 180}\u00B0`;
        } else if (p.unit === '%') {
            s = `${val}%`;
        } else if (p.unit === 'log10') {
            s = String(10 ** val);
        } else if (p.unit === 'log10%') {
            s = `${10 ** val}%`;
        } else {
            s = String(val);
        }
        return s.replace(/-/, '\u2212');
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
