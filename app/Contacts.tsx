import './Contacts.css'

import { Icon } from './Icon';
import type { IconSize } from './IconSize';
import { typedEntries } from './util/typedEntries';

const contacts = {
    github: 'https://github.com/aleksei-berezkin/code-art',
    'linked-in': 'https://www.linkedin.com/in/a-v-berezkin',
    facebook: 'https://www.facebook.com/people/Alexey-Berezkin/100005955309004',
    twitter: 'https://twitter.com/a_v_berezkin',
    dev: 'https://dev.to/alekseiberezkin',
}

export function Contacts({ size, color }: { size: IconSize, color: 'light' | 'dark' }) {
    return <section role='contentinfo' className={`contacts ${color}`}>
        {
            typedEntries(contacts).map(([pic, url]) =>
                <a href={url} target='_blank' className='link'>
                    <Icon pic={pic} size={size}/>
                </a>
            )
        }
    </section>
}
