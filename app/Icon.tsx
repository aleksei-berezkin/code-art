import type { IconSize } from './IconSize'
import type { Css, Var } from 'typique'
import { sc } from './sc'
import type { ThemeVars } from './theme'

// TODO .$arrow-down not working, replaced with 'arrowDown'
type Pic = 'arrowDown' | 'close' | 'download' | 'menu' | 'reload' | 'github' | 'dev' | 'linked-in' | 'facebook' | 'twitter'

const viewBoxes = {
    'arrowDown': '6 8.59 12 7.41',
    'dev': '0 32 448 448',
} as {[pic in Pic]?: string}

const defaultViewBox = '0 0 24 24'

export function Icon({ pic, size='lg' }: { pic?: Pic, size?: IconSize }) {
    const heightBaseVar = '--height-base' satisfies Var
    const heightMulVar = '--height-mul' satisfies Var

    return (
        <svg
            className={
                sc({ pic, size }, {
                    _: 'icon-svg',
                    pic: {
                        arrowDown: 'icon-svg-pic-arrow-down',
                    },
                    size: {
                        md: 'icon-svg-size-md',
                        lg: 'icon-svg-size-lg',
                    },
                } satisfies Css<{
                    fill: 'currentColor'
                    height: `calc(var(${typeof heightBaseVar}) * var(${typeof heightMulVar}))`
                    stroke: 'none'
                    verticalAlign: 'bottom'

                    [heightBaseVar]: 20
                    [heightMulVar]: '1'

                    '.$pic$arrowDown': {
                        verticalAlign: 'baseline'
                        [heightBaseVar]: 7.41
                    }
                    '.$size$md': {
                        [heightMulVar]: '1.2'
                    }
                    '.$size$lg': {
                        [heightMulVar]: '1.6'
                    }
                }>)
            }
            viewBox={ (pic && viewBoxes[pic]) ?? defaultViewBox }
        >
            <title>{ pic ?? '' }</title>
            {
                pic === 'arrowDown' ? <path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z'/>
                    : pic === 'download' ? <path d='M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z'/>
                    : pic === 'close' ? <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/>
                    : pic === 'menu' ? <path d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'/>
                    : pic === 'reload' ? <path d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/>
                    : pic === 'github' ? <path d='M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3'/>
                    : pic === 'dev' ? <path d='M120.12 208.29c-3.88-2.9-7.77-4.35-11.65-4.35H91.03v104.47h17.45c3.88 0 7.77-1.45 11.65-4.35s5.82-7.25 5.82-13.06v-69.65c-.01-5.8-1.96-10.16-5.83-13.06zM404.1 32H43.9C19.7 32 .06 51.59 0 75.8v360.4C.06 460.41 19.7 480 43.9 480h360.2c24.21 0 43.84-19.59 43.9-43.8V75.8c-.06-24.21-19.7-43.8-43.9-43.8zM154.2 291.19c0 18.81-11.61 47.31-48.36 47.25h-46.4V172.98h47.38c35.44 0 47.36 28.46 47.37 47.28zm100.68-88.66H201.6v38.42h32.57v29.57H201.6v38.41h53.29v29.57h-62.18c-11.16.29-20.44-8.53-20.72-19.69V193.7c-.27-11.15 8.56-20.41 19.71-20.69h63.19zm103.64 115.29c-13.2 30.75-36.85 24.63-47.44 0l-38.53-144.8h32.57l29.71 113.72 29.57-113.72h32.58z'/>
                    : pic === 'linked-in' ? <path d='M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z'/>
                    : pic === 'facebook' ? <path d='M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m13 2h-2.5A3.5 3.5 0 0 0 12 8.5V11h-2v3h2v7h3v-7h3v-3h-3V9a1 1 0 0 1 1-1h2V5z'/>
                    : pic === 'twitter' ? <path d='M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z'/>
                    : undefined
            }
        </svg>
    )
}

export const [arrowDownWrapperClass, wrOpenClass] = ['arrow-down-wrapper', 'wr-open'] satisfies Css<{
    display: 'inline-block';
    transition: `transform var(${ThemeVars['iconTx']})`
    '.$1': {
        transform: 'rotate(-180deg)'
    }
}>
