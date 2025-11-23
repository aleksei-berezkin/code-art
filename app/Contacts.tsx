import { Icon } from './Icon'
import type { IconSize } from './IconSize'
import { typedEntries } from './util/typedEntries'
import type { Css, Var } from 'typique'
import { sc } from './sc'
import type { ThemeVars } from './theme'

const contacts = {
    github: 'https://github.com/aleksei-berezkin/code-art',
    'linked-in': 'https://www.linkedin.com/in/a-v-berezkin',
    facebook: 'https://www.facebook.com/people/Alexey-Berezkin/100005955309004',
    twitter: 'https://twitter.com/a_v_berezkin',
    dev: 'https://dev.to/alekseiberezkin',
}

export function Contacts(props: { size: IconSize, color: 'light' | 'dark' }) {
    const colVar = '--col' satisfies Var
    const hoverColVar = '--hover-col' satisfies Var
    const liMrVar = '--li-mr' satisfies Var

    return <ul className={
        sc(props, {
            _: 'contacts-ul',
            size: {
                sm: 'contacts-ul-size-sm',
            },
            color: {
                light: 'contacts-ul-color-light',
                dark: 'contacts-ul-color-dark',
            },
        } satisfies Css<{
            display: 'flex'
            listStyle: 'none'
            margin: 0
            padding: 0
            [liMrVar]: '.65em'
            '.$size$sm': {
                [liMrVar]: '.45em'
            }
            '& > li:not(:last-child)': {
                marginRight: `var(${typeof liMrVar})`
            }
            '.$color$light': {
                [colVar]: '#0006'
                [hoverColVar]: '#0009'
            }
            '.$color$dark': {
                [colVar]: '#00000098'
                [hoverColVar]: '#000e'
            }
        }>
    ) }>
        {
            typedEntries(contacts).map(([pic, url]) =>
                <li key={url}>
                    <a key={url} href={url} target='_blank' className={ 'contacts-a' satisfies Css<{
                        textDecoration: 'none'
                        transition: `color var(${ThemeVars['linkTx']})`
                        '&, &:visited': {
                            color: `var(${typeof colVar})`
                        }
                        '&:hover': {
                            color: `var(${typeof hoverColVar})`
                        }
                    }> }>
                        <Icon pic={pic} size={props.size}/>
                    </a>
                </li>
            )
        }
    </ul>
}
