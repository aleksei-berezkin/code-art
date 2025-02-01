import './ImgParamsMenu.css'

import React, { useRef, type ChangeEvent } from 'react'

import { type ImgParamsSimple, type ImgParamsSimpleSlice, useStore } from './store'
import { useShallow } from 'zustand/react/shallow'

import { type CheckboxParam, type ChoicesParam, type ColorParam, type GroupName, type ImgParams, type SliderParam } from './model/ImgParams'
import { getSliderLabel } from './model/ImgParams'
import { Icon } from './Icon'
import { Contacts } from './Contacts'
import { useLayerState } from './useLayerState'
import { useElementHeight } from './useElementHeight'
import { sourceSpecs } from './model/sourceSpecs'


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
                        <Parameter key={paramName} groupName={groupName} paramName={paramName} tabIndex={isOpen ? undefined : -1}/>
                    )
                }
                </div>
            </div>
        </div>
    )
}

function Parameter(paramProps: ParamProps) {
    const {groupName, paramName} = paramProps

    const paramType = useStore(({imgParams}: ImgParamsSimpleSlice) =>
        imgParams![groupName][paramName].type
    )

    return <>
        <div className='param-label-wr'>
            <label htmlFor={getParamInputId(groupName, paramName)}>{paramName}</label>
        </div>

        {
            <SliderParamLabel {...paramProps} bound='min'/>
        }

        {
            paramType === 'slider' && <SliderParamComponent {...paramProps}/>
        }

        {
            paramType === 'choices' && <ChoicesParamComponent {...paramProps}/>
        }

        {
            paramType === 'color' && <ColorParamComponent {...paramProps}/>
        }

        {
            paramType === 'checkbox' && <CheckboxParamComponent {...paramProps}/>
        }

        {
            <SliderParamLabel bound='max' {...paramProps}/>
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

function SliderParamComponent({groupName, paramName, tabIndex} : ParamProps) {
    const {min, max, val, unit} = useStore(useShallow(({imgParams}: ImgParamsSimpleSlice) =>
        imgParams![groupName][paramName] as SliderParam
    ))

    function handleSliderChange(e: ChangeEvent<HTMLInputElement>) {
        useStore.getState().updateImgParamsAndIncDrawCounter((draft: ImgParamsSimple) => {
            (draft[groupName][paramName] as SliderParam).val = Number(e.target.value)
        })
    }

    return (
        <input
            id={getParamInputId(groupName, paramName)}
            onInput={handleSliderChange}
            tabIndex={tabIndex}
            title={getSliderLabel(val, unit)}
            type='range'
            max={max}
            min={min}
            step='any'
            value={val}
        />
    )
}


function ChoicesParamComponent({groupName, paramName, tabIndex}: ParamProps) {
    const val = useStore(({imgParams}: ImgParamsSimpleSlice) =>
        (imgParams![groupName][paramName] as ChoicesParam).val
    )
    const choices = useStore(useShallow(({imgParams}: ImgParamsSimpleSlice) =>
        (imgParams![groupName][paramName] as ChoicesParam).choices
    ))

    const handleChoiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
        useStore.getState().updateImgParamsAndIncDrawCounter((draft: ImgParamsSimple) => {
            (draft[groupName][paramName] as ChoicesParam).val = e.target.value
        })
    }

    return (
        <select
            id={getParamInputId(groupName, paramName)}
            onChange={handleChoiceChange}
            tabIndex={tabIndex}
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

function ColorParamComponent({groupName, paramName, tabIndex}: ParamProps) {
    const val = useStore(({imgParams}: ImgParamsSimpleSlice) =>
        (imgParams![groupName][paramName] as ColorParam).val
    )

    function handleColorChange(e: ChangeEvent<HTMLInputElement>) {
        useStore.getState().updateImgParamsAndIncDrawCounter((draft: ImgParamsSimple) => {
            (draft[groupName][paramName] as ColorParam).val = e.target.value
        })
    }

    return <input
        id={getParamInputId(groupName, paramName)}
        onChange={handleColorChange}
        tabIndex={tabIndex}
        type='color'
        value={val}
    />
}

function CheckboxParamComponent({groupName, paramName, tabIndex}: ParamProps) {
    const val = useStore(({imgParams}: ImgParamsSimpleSlice) =>
        (imgParams![groupName][paramName] as CheckboxParam).val
    )

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        if ((groupName as GroupName) === 'attribution' && !e.target.checked) {
            const attrRequired = (paramName as keyof ImgParams['attribution']) === 'code-art'
                ? 'code-art.pictures'
                : sourceSpecs[useStore.getState().imgParams!.source.source.val].credit
            alert('Please make sure to give the attribution to ' + attrRequired)
        }

        useStore.getState().updateImgParamsAndIncDrawCounter((draft: ImgParamsSimple) => {
            (draft[groupName][paramName] as CheckboxParam).val = e.target.checked
        })
    }

    return <input
        id={getParamInputId(groupName, paramName)}
        onChange={handleChange}
        tabIndex={tabIndex}
        type='checkbox'
        checked={val}
    />
}

type ParamProps = {
    groupName: string,
    paramName: string,
    tabIndex: number | undefined,
}

function getParamInputId(g: string, p: string) {
    return `img-param__${[g, p].map(s => s.replace(/[^-\w]/g, '_')).join('__')}`;
}
