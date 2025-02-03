import { FlatCompat } from '@eslint/eslintrc'
import stylistic from '@stylistic/eslint-plugin'
import parserTs from '@typescript-eslint/parser'

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
})

const eslintConfig = [
    {
        languageOptions: {
            parser: parserTs,
        },
        plugins: {
            '@stylistic/ts': stylistic,
            '@stylistic': stylistic,
        },
        rules: {
            '@stylistic/ts/comma-dangle': [
                'error',
                {
                    'arrays': 'always-multiline',
                    'functions': 'only-multiline',
                    'generics': 'always-multiline',
                    'objects': 'always-multiline',
                    'tuples': 'always-multiline',
                },
            ],
            '@stylistic/eol-last': 'error',
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/ts/semi': ['error', 'never'],
        },
    },
    ...compat.config({
        extends: ['next/core-web-vitals', 'next/typescript'],
        rules: {
            '@next/next/no-page-custom-font': 'off',
        },
    }),
]

export default eslintConfig
