import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        ignores: [
            "app/views/misc/mode-regexp.js",
            "lib/tmp/jsonxl-snapshot9.js",
            "build/**",
            "dist/**",
            "**/*.min.js"
        ]
    },
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                require: 'readonly',
                discovery: 'readonly',
                document: 'readonly',
                window: 'readonly',
                console: 'readonly',
                module: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                Promise: 'readonly',
                Map: 'readonly',
                Set: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                fetch: 'readonly',
                process: 'readonly',
                cancelAnimationFrame: 'readonly',
                requestAnimationFrame: 'readonly',
                WeakMap: 'readonly',
                global: 'readonly',
                globalThis: 'readonly',
                FormData: 'readonly',
                Blob: 'readonly',
                File: 'readonly',
                navigator: 'readonly',
                Worker: 'readonly',
                performance: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                location: 'readonly',
                history: 'readonly',
                MutationObserver: 'readonly',
                IntersectionObserver: 'readonly'
            }
        },
        rules: {
            "@typescript-eslint/no-require-imports": 0,
            "no-duplicate-case": 2,
            "no-undef": 2,
            "no-empty": [
                2,
                {
                    "allowEmptyCatch": true
                }
            ],
            "no-implicit-coercion": [
                2,
                {
                    "boolean": true,
                    "string": true,
                    "number": true,
                    "allow": ["*"]
                }
            ],
            "no-with": 2,
            "no-multi-str": 2,
            "yoda": [
                2,
                "never"
            ],
            "camelcase": [
                2,
                {
                    "properties": "never"
                }
            ],
            "curly": [
                2,
                "all"
            ],
            "dot-notation": 2,
            "one-var": [
                2,
                "never"
            ],
            "spaced-comment": [
                2,
                "always"
            ]
        }
    }
);
