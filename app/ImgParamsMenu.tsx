import './ImgParamsMenu.css'

import React, { useRef, type ChangeEvent } from 'react'

import { type ImgParamsSimple, type ImgParamsSimpleSlice, useStore } from './store'
import { useShallow } from 'zustand/react/shallow'

import { type ChoicesParam, type ColorParam, type GroupName, type ImgParams, type SliderParam } from './model/ImgParams'
import { getSliderLabel } from './model/ImgParams'
import { Icon } from './Icon'
import { Contacts } from './Contacts'
import { noAttribution } from './model/attributionPos'
import { sourceSpecs } from './model/sourceSpecs'
import { useLayerState } from './useLayerState'
import { useElementHeight } from './useElementHeight'


export function ImgParamsMenu() {
    const rootRef = useRef<HTMLElement>(null)
    
    const isOpen = useStore(state => state.openDialog === 'menu')
    const setOpenDialog = useStore(state => state.setOpenDialog)

    const groupNames = useStore(useShallow(({imgParams}) =>
        imgParams ? Object.keys(imgParams) as GroupName[] : undefined
    ))

    const layerState = useLayerState(isOpen)

    if (layerState === 'layer-hidden') return undefined

    return <aside className={`img-params-menu dialog-layer ${layerState}`} aria-label='Image params' ref={rootRef}>
        <div>
        {
            groupNames!.map(groupName =>
                <GroupComponent key={groupName} groupName={groupName} />
            )
        }
        </div>

        <div className='footer-group'>
            <Contacts size='sm' color='light'/>
            <button className='footer-about' onClick={() => setOpenDialog('about')}>about</button>
        </div>
    </aside>
}

function GroupComponent({groupName}: {groupName: string}) {
    const isOpen = useStore(state => state.openGroups.includes(groupName))
    const paramNames = useStore(useShallow(({imgParams}: ImgParamsSimpleSlice) =>
        Object.keys(imgParams![groupName])
))
    function handleToggleGroup() {
        useStore.getState().toggleGroup(groupName)
    }

    const groupBodyInnerRef = useRef<HTMLDivElement>(null)
    const groupHeight = useElementHeight(isOpen, groupBodyInnerRef, 'auto' /* On mount with open group */)

    return (
        <div className='group' role='region' aria-label={`Controls group: ${groupName}`}>
            <button className='group-button' aria-label={`Toggle group visibility: ${groupName}`} onClick={handleToggleGroup}>
                <div className={`arrow-down-wrapper ${isOpen ? 'open' : ''}`}>
                    <Icon pic='arrow-down' size='sm'/>
                </div>
                <span className='group-button-txt'>{groupName}</span>
            </button>

            <div className={`group-body ${isOpen ? 'open' : ''}`} style={{height: isOpen ? groupHeight : '0'}}>
                <div className='group-body-inner' ref={groupBodyInnerRef}>
                {
                    paramNames.map(paramName =>
                        <Parameter key={paramName} groupName={groupName} paramName={paramName} isOpen={isOpen}/>
                    )
                }
                </div>
            </div>
        </div>
    )
}

function Parameter({groupName, paramName, isOpen}: ParamProps) {
    const paramType = useStore(({imgParams}: ImgParamsSimpleSlice) =>
        imgParams![groupName][paramName].type
    )

    return <>
        <div className='param-label-wr'>
            <label htmlFor={getParamInputId(groupName, paramName)}>{paramName}</label>
        </div>

        {
            <SliderParamLabel groupName={groupName} paramName={paramName} bound='min' isOpen={isOpen}/>
        }

        {
            paramType === 'slider' && <SliderParamComponent groupName={groupName} paramName={paramName} isOpen={isOpen}/>
        }

        {
            paramType === 'choices' && <ChoicesParamComponent groupName={groupName} paramName={paramName} isOpen={isOpen}/>
        }

        {
            paramType === 'color' && <ColorParamComponent groupName={groupName} paramName={paramName} isOpen={isOpen}/>
        }

        {
            <SliderParamLabel groupName={groupName} paramName={paramName} bound='max' isOpen={isOpen}/>
        }
    </>
}

function SliderParamLabel<Bound extends 'min' | 'max'>({groupName, paramName, bound} : ParamProps & {bound: Bound}) {
    const sliderParam = useStore(useShallow(({imgParams}: ImgParamsSimpleSlice) => {
        const param = imgParams![groupName][paramName]
        return param.type === 'slider' ? param : undefined
    }))

    return (
        <div className={`param-${bound}`}>
            {
                sliderParam && getSliderLabel(sliderParam[bound], sliderParam.unit)
            }
        </div>
    )
}

function SliderParamComponent({groupName, paramName, isOpen} : ParamProps) {
    const {min, max, val, unit} = useStore(useShallow(({imgParams}: ImgParamsSimpleSlice) =>
        imgParams![groupName][paramName] as SliderParam
    ))

    const updateImgParamsAndIncDrawCounter = useStore(state => state.updateImgParamsAndIncDrawCounter)

    function handleSliderChange(e: ChangeEvent<HTMLInputElement>) {
        updateImgParamsAndIncDrawCounter((draft: ImgParamsSimple) => {
            (draft[groupName][paramName] as SliderParam).val = Number(e.target.value)
        })
    }

    return (
        <input
            className='input-slider'
            id={getParamInputId(groupName, paramName)}
            onInput={handleSliderChange}
            tabIndex={isOpen ? undefined : -1}
            title={getSliderLabel(val, unit)}
            type='range' min={min} max={max} step='any'
            value={val}
        />
    )
}


function ChoicesParamComponent({groupName, paramName, isOpen}: ParamProps) {
    const val = useStore(({imgParams}: ImgParamsSimpleSlice) =>
        (imgParams![groupName][paramName] as ChoicesParam).val
    )
    const choices = useStore(useShallow(({imgParams}: ImgParamsSimpleSlice) =>
        (imgParams![groupName][paramName] as ChoicesParam).choices
    ))

    const updateImgParamsAndIncDrawCounter = useStore(state => state.updateImgParamsAndIncDrawCounter)

    const handleChoiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
        if ((groupName as GroupName) === 'output image'
            && (paramName as keyof ImgParams['output image']) === 'attribution'
            && e.target.value === noAttribution
        ) {
            alert('Please make sure to give attribution both to code-art.pictures and to '
                + sourceSpecs[useStore.getState().imgParams!.source.source.val].credit
            )
        }

        updateImgParamsAndIncDrawCounter((draft: ImgParamsSimple) => {
            (draft[groupName][paramName] as ChoicesParam).val = e.target.value
        })
    }

    return (
        <select
            className='input-select'
            id={getParamInputId(groupName, paramName)}
            onChange={handleChoiceChange}
            tabIndex={isOpen ? undefined : -1}
            value={val}
        >
        {
            choices.map(choice =>
                <option key={choice} value={choice}>{choice}</option>
            )
        }
        </select>
    )
}

function ColorParamComponent({groupName, paramName, isOpen}: ParamProps) {
    const val = useStore(({imgParams}: ImgParamsSimpleSlice) =>
        (imgParams![groupName][paramName] as ColorParam).val
    )

    const updateImgParamsAndIncDrawCounter = useStore(state => state.updateImgParamsAndIncDrawCounter)

    function handleColorChange(e: ChangeEvent<HTMLInputElement>) {
        updateImgParamsAndIncDrawCounter((draft: ImgParamsSimple) => {
            (draft[groupName][paramName] as ColorParam).val = e.target.value
        })
    }

    return <input
        id={getParamInputId(groupName, paramName)}
        onChange={handleColorChange}
        tabIndex={isOpen ? undefined : -1}
        type='color'
        value={val}
    />
}

type ParamProps = {
    groupName: string,
    paramName: string,
    isOpen: boolean,
}

function getParamInputId(g: string, p: string) {
    return `img-param__${[g, p].map(s => s.replace(/[^-\w]/g, '_')).join('__')}`;
}
