import type { Lang } from './Lang';

export type SourceSpec = {
    lang: Lang,
    url: string,
}

export const sourceSpecs: {[name: string]: SourceSpec} = {
    'React DOM min': {
        lang: 'js min',
        url: 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js',
    },
    'Lodash min': {
        lang: 'js min',
        url: 'https://unpkg.com/lodash@4.17.21/lodash.min.js',
    },
    'Underscore min': {
        lang: 'js min line',
        url: 'https://unpkg.com/underscore@1.13.2/underscore-min.js',
    },
    'Vue min': {
        lang: 'js min line',
        url: 'https://unpkg.com/vue@3.2.30/dist/vue.esm-browser.prod.js'
    },
    'Jquery min': {
        lang: 'js min line',
        url: 'https://unpkg.com/jquery@3.6.0/dist/jquery.min.js',
    },

    'webpack: PackFileCacheStrategy.js': {
        lang: 'js',
        url: 'https://raw.githubusercontent.com/webpack/webpack/6941c519e901629a6dfcd736ac191771cd3ac03e/lib/cache/PackFileCacheStrategy.js',
    },
    'Vue: patch.js': {
        lang: 'js',
        url: 'https://raw.githubusercontent.com/vuejs/vue/52608302e9bca84fb9e9f0499e89acade78d3d07/src/core/vdom/patch.js',
    },
    'npm: npm.js': {
        lang: 'js',
        url: 'https://raw.githubusercontent.com/npm/cli/6734ba36dd6e07a859ab4d6eb4f264d2c0022276/lib/npm.js',
    },
    'acorn: tokenize.js': {
        lang: 'js',
        url: 'https://raw.githubusercontent.com/acornjs/acorn/c528c799ff944feaed7c9027f63307cf3d3891a0/acorn/src/tokenize.js',
    },
    'React: ReactDOMHostConfig.js': {
        lang: 'js',
        url: 'https://raw.githubusercontent.com/facebook/react/848e802d203e531daf2b9b0edb281a1eb6c5415d/packages/react-dom/src/client/ReactDOMHostConfig.js',
    },
};
