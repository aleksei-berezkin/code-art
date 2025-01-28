import './ImgParamsMenu.css'

import React, { useState, type ChangeEvent } from 'react'

import { type ImgParamsSimple, type ImgParamsSimpleSlice, useStore } from './store'
import { useShallow } from 'zustand/react/shallow'

import { type ChoicesParam, type ColorParam, type GroupName, type ImgParams, type SliderParam } from './model/ImgParams'
import { getSliderLabel } from './model/ImgParams'
import { Icon } from './Icon'
import { Contacts } from './Contacts'
import { noAttribution } from './model/attributionPos'
import { sourceSpecs } from './model/sourceSpecs'


export function ImgParamsMenu() {
    const isOpen = useStore(state => state.openDialog === 'menu')
    const setOpenDialog = useStore(state => state.setOpenDialog)

    const groupNames = useStore(useShallow(({imgParams}) =>
        imgParams ? Object.keys(imgParams) as GroupName[] : undefined
    ))

    if (!isOpen || !groupNames) return undefined

    return <aside className={`menu-root ${isOpen ? 'open' : ''} dialog-layer`} aria-label='Image params'>
        <div>
        {
            groupNames.map(groupName =>
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
    const [isOpen, setOpen] = useState(false)
    const paramNames = useStore(useShallow(({imgParams}: ImgParamsSimpleSlice) =>
        Object.keys(imgParams![groupName])
))
    function handleToggleGroup() {
        setOpen(!isOpen)
    }

    return (
        <div className='group' role='region' aria-label={`Controls group: ${groupName}`}>
            <button className='group-button' aria-label={`Toggle group visibility: ${groupName}`} onClick={handleToggleGroup}>
                <Icon pic='arrow-down' size='sm' rotateDeg={isOpen ? -180 : 0}/>
                <span className='group-button-txt'>{groupName}</span>
            </button>

            <div className={`group-body ${isOpen ? 'open' : ''}`}>
            {
                paramNames.map(paramName =>
                    <Parameter key={paramName} groupName={groupName} paramName={paramName} />
                )
            }
            </div>
        </div>
    )
}

function Parameter({groupName, paramName}: ParamProps) {
    const paramType = useStore(({imgParams}: ImgParamsSimpleSlice) =>
        imgParams![groupName][paramName].type
    )

    return <>
        <div className='param-label-wr'>
            <label htmlFor={getParamInputId(groupName, paramName)}>{paramName}</label>
        </div>

        {
            <SliderParamLabel groupName={groupName} paramName={paramName} bound='min' />
        }

        {
            paramType === 'slider' && <SliderParamComponent groupName={groupName} paramName={paramName} />
        }

        {
            paramType === 'choices' && <ChoicesParamComponent groupName={groupName} paramName={paramName} />
        }

        {
            paramType === 'color' && <ColorParamComponent groupName={groupName} paramName={paramName} />
        }

        {
            <SliderParamLabel groupName={groupName} paramName={paramName} bound='max' />
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

function SliderParamComponent({groupName, paramName} : ParamProps) {
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
        <input className='input-slider' id={getParamInputId(groupName, paramName)}
            type='range' min={min} max={max} step='any'
            value={val}
            onInput={handleSliderChange}
            title={getSliderLabel(val, unit)}
        />
    )
}


function ChoicesParamComponent({groupName, paramName}: ParamProps) {
    const val = useStore(({imgParams}: ImgParamsSimpleSlice) =>
        (imgParams![groupName][paramName] as ChoicesParam).val
    )
    const choices = useStore(useShallow(({imgParams}: ImgParamsSimpleSlice) =>
        (imgParams![groupName][paramName] as ChoicesParam).choices
    ))
    const currentSourceSelection = useStore(({imgParams}) =>
        imgParams!.source.source.val
    )

    const updateImgParamsAndIncDrawCounter = useStore(state => state.updateImgParamsAndIncDrawCounter)

    const handleChoiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
        if ((groupName as GroupName) === 'output image'
            && (paramName as keyof ImgParams['output image']) === 'attribution'
            && e.target.value === noAttribution
        ) {
            alert('Please make sure to give attribution both to code-art.pictures and to '
                + sourceSpecs[currentSourceSelection].credit
            )
        }

        updateImgParamsAndIncDrawCounter((draft: ImgParamsSimple) => {
            (draft[groupName][paramName] as ChoicesParam).val = e.target.value
        })
    }

    return (
        <select className='input-select' id={getParamInputId(groupName, paramName)} onChange={handleChoiceChange} value={val}>
        {
            choices.map(choice =>
                <option key={choice} value={choice}>{choice}</option>
            )
        }
        </select>
    )
}

function ColorParamComponent({groupName, paramName}: ParamProps) {
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
        type='color'
        value={val}
        onChange={handleColorChange}
    />
}

type ParamProps = {
    groupName: string,
    paramName: string,
}

function getParamInputId(g: string, p: string) {
    return `img-param__${[g, p].map(s => s.replace(/[^-\w]/g, '_')).join('__')}`;
}
