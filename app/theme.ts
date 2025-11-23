import type { Css, Var } from 'typique'

export const themeVars = {
    borderRadiusStd: '--theme-border-radius-std',
    buttonSize: '--theme-button-size',
    iconTx: '--theme-icon-tx',
    linkCol: '--theme-link-col',
    linkColHover: '--theme-link-col-hover',
    linkTx: '--theme-link-tx',
    mainTx: '--theme-main-tx',
    menuBgCol: '--theme-menu-bg-col',
    menuBackdropFilter: '--theme-menu-backdrop-filter',
    menuShadow: '--theme-menu-shadow',
    paddingStd: '--theme-padding-std',
} as const satisfies Var

export type ThemeVars = typeof themeVars

[] satisfies Css<{
    body: {
        [themeVars.borderRadiusStd]: 8
        [themeVars.buttonSize]: 48
        [themeVars.iconTx]: '200ms'
        [themeVars.linkCol]: '#00000088'
        [themeVars.linkColHover]: '#000c'
        [themeVars.linkTx]: '300ms'
        [themeVars.mainTx]: '250ms'
        [themeVars.menuBgCol]: '#ffffffb8'
        [themeVars.menuBackdropFilter]: 'blur(4px)'
        [themeVars.menuShadow]: '0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%)'
        [themeVars.paddingStd]: 16
    }
}>
