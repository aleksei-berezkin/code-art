import React, { useRef, useState, type ChangeEvent } from 'react'

import { type ImgParamsSimple, type ImgParamsSimpleSlice, useStore } from './store'
import { useShallow } from 'zustand/react/shallow'

import { type CheckboxParam, type ChoicesParam, type ColorParam, type GroupName, type ImgParams, type SliderParam } from './model/ImgParams'
import { getSliderLabel } from './model/ImgParams'
import { Icon } from './Icon'
import { Contacts } from './Contacts'
import { useLayerStateClass } from './useLayerStateClass'
import { sourceSpecs } from './model/sourceSpecs'
import { cc } from './cc'
import type { Css, Var } from 'typique'

declare const isNarrowQuery = '@media (max-width: 510px)'

const menuTxVar = '--menu-tx' satisfies Var
const gridGapVar = '--grid-gap' satisfies Var

export function ImgParamsMenu() {
    const rootRef = useRef<HTMLElement>(null)

    const isOpen = useStore(state => state.openDialog === 'menu')
    const setOpenDialog = useStore(state => state.setOpenDialog)

    const groupNames = useStore(useShallow(({imgParams}) =>
        imgParams ? Object.keys(imgParams) as GroupName[] : undefined
    ))

    const layerState = useLayerStateClass(isOpen)

    if (!layerState) return undefined

    return <aside aria-label='Image params' ref={rootRef} className={ cc(
        'img-params-menu-aside' satisfies Css<{
            [menuTxVar]: 'var(--ic-tx)'
            [gridGapVar]: 'calc(var(--pad-std) *.75)'

            backgroundColor: 'var(--menu-bg-color)'
            backdropFilter: 'var(--menu-backdrop-filter)'
            borderRadius: 'var(--bord-r-std)'
            boxSizing: 'border-box'
            boxShadow: 'var(--menu-shadow)'
            left: 'var(--pad-std)'
            margin: 0
            maxHeight: 'calc(var(--main-h) - 3 * var(--pad-std) - var(--btn-size))'
            overflowY: 'scroll'
            paddingTop: 'var(--pad-std)'
            position: 'absolute'
            top: 'calc(var(--pad-std) * 2 + var(--btn-size))'

            [isNarrowQuery]: {
                maxWidth: `calc(100vw - 2 * var(--pad-std))`
            }
        }>,
        'dialog-layer',
        layerState,
    ) }>
        <div>
        {
            groupNames!.map(groupName =>
                <GroupComponent key={groupName} groupName={groupName} />
            )
        }
        </div>

        <footer className={ 'img-params-menu-footer' satisfies Css<{
            alignItems: 'center'
            display: 'flex'
            flexDirection: 'column'
            paddingBottom: 'var(--pad-std)'
        }> }>
            <Contacts size='sm' color='light'/>
            <button
                onClick={() => setOpenDialog('about')}
                className={ 'img-params-menu-button' satisfies Css<{
                    color: `var(--link-c)`
                    letterSpacing: '.04em'
                    marginTop: `calc(var(${typeof gridGapVar}) * .7)`
                    transition: `color var(--link-tx)`
                    '&:hover': {
                        color: 'var(--link-c-h)'
                    }
                }> }
            >about</button>
        </footer>
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

    const [groupHeight, setGroupHeight] = useState<number | undefined>(undefined)
    const groupHeightStyleValue = isOpen
        ? (groupHeight ?? 'auto' /* mount with group opened and groupHeight unknown yet */)
        : 0

    const labelWVar = '--label-w' satisfies Var
    const inputWVar = '--input-w' satisfies Var

    return (
        <div role='region' aria-label={`Controls group: ${groupName}`} className={ 'group-component-div' satisfies Css<{
            paddingBottom: `var(${typeof gridGapVar})`
            paddingLeft: `var(--pad-std)`
            paddingRight: `var(--pad-std)`
        }> }>
            <button aria-label={`Toggle group visibility: ${groupName}`} onClick={handleToggleGroup} className={ 'group-component-button' satisfies Css<{
                transition: 'color var(--ic-tx), text-shadow var(--ic-tx)'
                '&:hover': {
                    color: '#000'
                }
                '&:active': {
                    color: 'unset'
                }
            }> }>
                <div className={`arrow-down-wrapper ${isOpen ? 'open' : ''}`}>
                    <Icon pic='arrowDown' size='sm'/>
                </div>
                <span className={ 'group-component-span' satisfies Css<{
                    paddingLeft: '.5em'
                    paddingRight: '1em'
                }>} >{ groupName }</span>
            </button>

            <div
                style={{height: groupHeightStyleValue}}
                className={ cc(
                    'group-component-div-0' satisfies Css<{
                        [labelWVar]: '3rem'
                        [inputWVar]: '12rem'

                        height: 0
                        opacity: 0
                        overflow: 'hidden'
                        paddingLeft: 'calc(1.6em)'
                        transition: `height var(${typeof menuTxVar}), opacity var(${typeof menuTxVar}), padding-top var(${typeof menuTxVar})`
                    }>,
                    isOpen && 'group-component-div-1' satisfies Css<{
                        opacity: '1'
                        paddingTop: `var(${typeof gridGapVar})`
                    }>,
                ) }
            >
                <div
                    ref={el => { if (el) setGroupHeight(el.clientHeight) }}
                    className={'group-component-div-2' satisfies Css<{
                        display: 'grid'
                        fontSize: '.9em'
                        gap: `calc(var(${typeof gridGapVar}) * .75)`
                        gridTemplateColumns: `auto var(${typeof labelWVar}) var(${typeof inputWVar}) var(${typeof labelWVar})`
                        [isNarrowQuery]: {
                            gridTemplateColumns: `auto minmax(auto, var(${typeof inputWVar}))`
                        }
                    }>}
                >
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
        <div className={'parameter-div' satisfies Css<{
            alignItems: 'center'
            display: 'flex'
        }>}>
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
        <div className={ cc(
            'slider-param-label-div' satisfies Css<{
                [isNarrowQuery]: {
                    display: 'none'
                }
            }>,
            bound === 'min' && 'slider-param-label-div-0' satisfies Css<{
                textAlign: 'right'
            }>,
        ) }>
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
            className={ 'slider-param-component' satisfies Css<{
                margin: 0
                width: '100%'
            }> }
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
            className={ 'choices-param-component-select' satisfies Css<{
                font: 'inherit'
                padding: '0.25em'
                width: '100%'
            }> }
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
        // TODO why not -input ?
        className={
            'checkbox-param-component' satisfies Css<{
                marginLeft: 0
                width: 'fit-content'
            }>
        }
    />
}

type ParamProps = {
    groupName: string,
    paramName: string,
    tabIndex: number | undefined,
}

function getParamInputId(g: string, p: string) {
    return `img-param__${[g, p].map(s => s.replace(/[^-\w]/g, '_')).join('__')}`
}
