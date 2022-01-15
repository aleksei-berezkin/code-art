<style>
    .menu-root {
        background-color: #ffffffb0;
        border-radius: 8px;
        box-sizing: border-box;
        box-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%);
        margin: 12px;
        padding: 16px;
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

<menu class='menu-root'>
    {#each Object.entries(imgParams) as p}
        {#if p[1].type === 'slider'}
            <div class='slider-wr'>
                <label class='slider-label' for={toId(p[0])}>{p[0]}</label>
                <div class='slider-min'>{toLabelNum(p[0], p[1].min)}</div>
                <!--suppress XmlDuplicatedId -->
                <input class='slider-slider' id={toId(p[0])} data-k={p[0]} type='range' min='{p[1].min}' max='{p[1].max}' step='any' value='{p[1].val}' on:input={handleSliderChange}/>
                <div class='slider-max'>{toLabelNum(p[0], p[1].max)}</div>
            </div>
        {/if}

        {#if p[1].type === 'choices'}
            <div class='choices-wr'>
                <label class='choices-label' for={toId(p[0])}>{p[0]}</label>
                <!--suppress XmlDuplicatedId -->
                <select class='choices-select' id={toId(p[0])} data-k={p[0]} on:change={handleChoiceChange}>
                    {#each p[1].choices as choice}
                        {#if p[1].val === choice}
                            <option value={choice} selected>{choice}</option>
                        {:else}
                            <option value={choice}>{choice}</option>
                        {/if}
                    {/each}
                </select>
            </div>
        {/if}

        {#if p[1].type === 'color'}
            <div class='choices-wr'>
                <label for={toId(p[0])}>{p[0]}</label>
                <div class='input-color-wr'>
                    <!--suppress XmlDuplicatedId -->
                    <input id={toId(p[0])} data-k={p[0]} type='color' class='input-color' value='{p[1].val}' on:change={handleColorChange}/>
                </div>
            </div>
        {/if}
    {/each}
</menu>

<script lang='ts'>
    import { ImgParams, ParamChoiceKey, ParamColorKey, ParamKey, ParamSliderKey } from './ImgParams';

    export let imgParams;
    export let paramsUpdated: (imgParams: ImgParams) => void;

    function toId(k: string) {
        return 'code-scene-control-' + k.replace(/\s/g, '-');
    }

    function toLabelNum(k: ParamKey, val: number) {
        let s;
        if (k === 'angle x' || k === 'angle y' || k === 'angle z') {
            s = `${val / Math.PI * 180}\u00B0`;
        } else if (k === 'translate x' || k === 'translate y' || k === 'translate z' || k === 'scroll' || k === 'glow radius' || k === 'glow color shift') {
            s = `${val}%`;
        } else if (k === 'blur') {
            s = `${10 ** val}%`;
        } else if (k === 'fade') {
            s = String(10 ** val);
        } else {
            s = String(val);
        }
        return s.replace(/-/, '\u2212');
    }

    function handleSliderChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const k = inputEl.dataset.k as ParamSliderKey;
        imgParams[k].val = Number(inputEl.value);
        paramsUpdated(imgParams);
    }

    function handleChoiceChange(e: Event) {
        const selectEl = (e.target as HTMLSelectElement);
        const k = selectEl.dataset.k as ParamChoiceKey;
        selectEl.selectedIndex
        imgParams[k].val = imgParams[k].choices[selectEl.selectedIndex];
        paramsUpdated(imgParams);
    }

    function handleColorChange(e: Event) {
        const inputEl = (e.target as HTMLInputElement);
        const k = inputEl.dataset.k as ParamColorKey;
        imgParams[k].val = inputEl.value;
        paramsUpdated(imgParams);
    }
</script>
