import { Main } from './Main'
import type { ThemeVars } from './theme'
import type { Css } from 'typique'

[] satisfies Css<{
    html: {
        backgroundColor: '#384048'
        backgroundImage: 'url(./public/bg-image.png)'
        backgroundSize: 'cover'
        backgroundPosition: 'center center'
        color: '#333'
        fontFamily: 'Roboto, sans-serif'
        fontSize: 16
    }

    'html, body': {
        height: '100%'
        margin: 0
        padding: 0
        width: '100%'
    }

    'a, a:visited': {
        color: `var(${ThemeVars['linkCol']})`
        fontFamily: 'unset'
        textDecoration: 'underline'
        textDecorationColor: 'transparent'
        transition: `text-decoration-color var(${ThemeVars['iconTx']}), color var(${ThemeVars['iconTx']})`
        WebkitTapHighlightColor: 'transparent'
    }

    'a:hover': {
        color: `var(${ThemeVars['linkColHover']})`
        textDecorationColor: `var(${ThemeVars['linkColHover']})`
    }

    button: {
        background: 'unset'
        border: 'unset'
        color: 'inherit'
        cursor: 'pointer'
        font: 'unset'
        margin: 0
        padding: 0
        textAlign: 'left'
        WebkitTapHighlightColor: 'transparent'
    }
}>

export default function Page() {
    return <Main/>
}
