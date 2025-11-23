import type { Css, Var } from 'typique'

export const centeredAbsVar = {
    h: '--centered-abs-h',
    w: '--centered-abs-w',
} as const satisfies Var

type H = typeof centeredAbsVar.h
type W = typeof centeredAbsVar.w

export const centeredAbsClass = 'centered-abs' satisfies Css<{
    height: `var(${H})`
    left: `calc(50% - calc(var(${W}) * .5))`
    position: 'absolute'
    top: `calc(50% - calc(var(${H}) * .5))`
    width: `var(${W})`
}>
