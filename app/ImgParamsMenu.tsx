import './ImgParamsMenu.css'

import { getSliderLabel, ImgParamVal, ParamGroup } from './model/ImgParams';
import { Icon } from './Icon';
import { getFromSelfOrParentDataset } from './util/getFromSelfOrParentDataset';
import { Contacts } from './Contacts';
import { noAttribution } from './model/attributionPos';
import { sourceSpecs } from './model/sourceSpecs';
import React, { useRef, useState, FormEvent, MouseEvent } from 'react';
import { typedEntries } from './util/typedEntries';
import { useStore } from './store';
import { produce } from 'immer';


export function ImgParamsMenu() {

    const isOpen = useStore(state => state.openDialog === 'menu')
    const setOpenDialog = useStore(state => state.setOpenDialog)

    const imgParams = useStore(state => state.imgParams)
    const setImgParams = useStore(state => state.setImgParams)

    const [openGroups, setOpenGroups] = useState<ParamGroup[]>([])

    const incDrawCounter = useStore(state => state.incDrawCounter)

    const menuRootRef = useRef<HTMLElement>(null)

    if (!isOpen || !imgParams) return undefined

    function handleToggleGroup(e: MouseEvent) {
        const g = getFromSelfOrParentDataset(e.target as HTMLElement, 'g') as ParamGroup
        const newOpenGroups = openGroups.includes(g)
            ? openGroups.filter(_g => _g !== g)
            : [g, ...openGroups]
        setOpenGroups(newOpenGroups)
    }

    const handleSliderChange = (e: FormEvent) => {
        const inputEl = (e.target as HTMLInputElement);
        const g = inputEl.dataset.g as ParamGroup
        const k = inputEl.dataset.k!
        setImgParams(produce(imgParams, (draft: any) => {
            draft[g][k].val = Number(inputEl.value)
        }))
        incDrawCounter()
    }

    const handleChoiceChange = (e: FormEvent) => {
        const selectEl = (e.target as HTMLSelectElement);
        const g = selectEl.dataset.g as ParamGroup
        const k = selectEl.dataset.k!
        if (g === 'output image' && k === 'attribution'
            && imgParams[g][k].choices[selectEl.selectedIndex] === noAttribution) {
            alert('Please make sure to give attribution both to code-art.pictures and to '
                + sourceSpecs[imgParams.source.source.val].credit
            )
        }
        setImgParams(produce(imgParams, (draft: any) => {
            draft[g][k].val = draft[g][k].choices[selectEl.selectedIndex]
        }))
        incDrawCounter()
    }

    const handleColorChange = (e: FormEvent) => {
        const inputEl = (e.target as HTMLInputElement)
        const g = inputEl.dataset.g as ParamGroup
        const k = inputEl.dataset.k!
        setImgParams(produce(imgParams, (draft: any) => {
            draft[g][k].val = inputEl.value
        }))
        incDrawCounter()
    }

    return <aside className={`menu-root ${isOpen ? 'open' : ''} dialog-layer`} aria-label='Image params' ref={menuRootRef}>
        <div>
        {
            typedEntries(imgParams).map(([g, ps]) =>
                <div key={g} className='group' role='region' aria-label={`Controls group: ${g}`}>
                    <button className='group-button' aria-label={`Toggle group visibility: ${g}`} data-g={g} onClick={handleToggleGroup}>
                        <Icon pic='arrow-down' size='sm' rotateDeg={openGroups.includes(g) ? -180 : 0}/>
                        <span className='group-button-txt'>{g}</span>
                    </button>

                    <div className={`group-body ${openGroups.includes(g) ? 'open' : ''}`}>
                    {
                        Object.entries(ps).map(([k, p]: [string, ImgParamVal]) =>
                            <React.Fragment key={k}>
                                <div className='param-label-wr'>
                                    <label htmlFor={toId(g, k)}>{k}</label>
                                </div>

                                <div className='param-min'>{p.type === 'slider' ? getSliderLabel(p, 'min') : ''}</div>

                                {
                                    p.type === 'slider' &&
                                    <input className='input-slider' id={toId(g, k)}
                                        data-g={g} data-k={k}
                                        type='range' min={p.min} max={p.max} step='any'
                                        value={p.val}
                                        onInput={handleSliderChange}
                                        title={getSliderLabel(p, 'val')}
                                    />
                                }

                                {
                                    p.type === 'choices' &&
                                    <select className='input-select' id={toId(g, k)} data-g={g} data-k={k} onChange={handleChoiceChange} value={p.val}>
                                        {
                                            p.choices.map(choice =>
                                                <option key={choice} value={choice}>{choice}</option>
                                            )
                                        }
                                    </select>
                                }

                                {
                                    p.type === 'color' &&
                                    <input id={toId(g, k)} data-g={g} data-k={k} type='color' value={p.val} onChange={handleColorChange}/>
                                }

                                <div className='param-max'>{p.type === 'slider' ? getSliderLabel(p, 'max') : ''}</div>
                            </React.Fragment>
                        )
                    }
                    </div>
                </div>
            )
        }
        </div>

        <div className='footer-group'>
            <Contacts size='sm' color='light'/>
            <button className='footer-about' onClick={() => setOpenDialog('about')}>about</button>
        </div>
    </aside>
}

function toId(g: string, k: string) {
    return `img-param__${[g, k].map(s => s.replace(/\s/g, '_')).join('__')}`;
}
