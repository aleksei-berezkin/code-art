import type { Lang } from './Lang';

export type SourceSpec = {
    lang: Lang,
    url: string,
}

export const sourceSpecs: {[name: string]: SourceSpec} = {
    'React DOM min': {
        lang: 'js min' as Lang,
        url: 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js',
    },
    'Lodash min': {
        lang: 'js min' as Lang,
        url: 'https://unpkg.com/lodash@4.17.21/lodash.min.js',
    },
    // 'Underscore min': {
    //     lang: 'js min line' as Lang,
    //     url: 'https://unpkg.com/underscore@1.13.2/underscore-min.js',
    // },
    'webpack: PackFileCacheStrategy': {
        lang: 'js' as Lang,
        url: 'https://raw.githubusercontent.com/webpack/webpack/6941c519e901629a6dfcd736ac191771cd3ac03e/lib/cache/PackFileCacheStrategy.js',
    },
    'vue: patch': {
        lang: 'js' as Lang,
        url: 'https://raw.githubusercontent.com/vuejs/vue/52608302e9bca84fb9e9f0499e89acade78d3d07/src/core/vdom/patch.js',
    },
    'npm.js': {
        lang: 'js' as Lang,
        url: 'https://raw.githubusercontent.com/npm/cli/6734ba36dd6e07a859ab4d6eb4f264d2c0022276/lib/npm.js',
    },
};
