// @ts-check
const eslint = require('@eslint/js');
const stylisticJs = require('@stylistic/eslint-plugin-js');
const angular = require('angular-eslint');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const unicorn = require('eslint-plugin-unicorn');
const tseslint = require('typescript-eslint');

/*
 * Thresholds calibrated on the migrated code base: the largest source file has 385 lines of code and the
 * most complex method 15 paths, and prettier wraps at 120 columns.
 */
const MAX_COMPLEXITY = 15;
const MAX_LINES = 400;
const MAX_LINES_SPEC = 600;
const MAX_LINE_LENGTH = 120;

module.exports = tseslint.config(
    {
        ignores: ['scripts/**', 'dist/**', 'coverage/**']
    },
    {
        files: ['**/*.ts'],
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
        processor: angular.processInlineTemplates,
        languageOptions: {
            parserOptions: {
                project: ['tsconfig.json', 'tsconfig.lib.json', 'tsconfig.spec.json'],
                tsconfigRootDir: __dirname
            }
        },
        plugins: {
            '@stylistic/js': stylisticJs,
            'simple-import-sort': simpleImportSort,
            unicorn
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/return-await': ['error', 'in-try-catch'],
            '@angular-eslint/component-selector': ['error', { type: 'element', prefix: ['bey'], style: 'kebab-case' }],
            '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['bey'], style: 'camelCase' }],
            '@angular-eslint/prefer-on-push-component-change-detection': 'error',
            '@angular-eslint/prefer-standalone': 'error',
            '@angular-eslint/no-empty-lifecycle-method': 'error',
            /* errors */
            'no-await-in-loop': 'error',
            'no-class-assign': 'error',
            'no-inner-declarations': 'error',
            'no-with': 'error',
            'no-console': 'error',
            'no-promise-executor-return': 'error',
            'no-unreachable-loop': 'error',
            /* best practices */
            'array-callback-return': 'error',
            'block-scoped-var': 'error',
            complexity: ['error', MAX_COMPLEXITY],
            'consistent-return': 'error',
            curly: 'error',
            'default-case': 'error',
            'default-param-last': 'error',
            eqeqeq: 'error',
            'grouped-accessor-pairs': 'error',
            'guard-for-in': 'error',
            'no-alert': 'error',
            'no-caller': 'error',
            'no-constructor-return': 'error',
            'no-div-regex': 'error',
            'no-else-return': 'error',
            'no-eq-null': 'error',
            'no-eval': 'error',
            'no-extend-native': 'error',
            'no-extra-bind': 'error',
            'no-implicit-coercion': 'error',
            'no-implicit-globals': 'error',
            'no-implied-eval': 'error',
            'no-iterator': 'error',
            'no-labels': 'error',
            'no-lone-blocks': 'error',
            'no-loop-func': 'off',
            'no-multi-str': 'error',
            'no-new': 'error',
            'no-new-func': 'error',
            'no-new-wrappers': 'error',
            'no-octal-escape': 'error',
            'no-proto': 'error',
            'no-restricted-imports': 'off',
            'no-restricted-properties': 'error',
            'no-return-assign': 'error',
            'no-script-url': 'error',
            'no-self-compare': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            'no-unmodified-loop-condition': 'error',
            'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }],
            'no-useless-call': 'error',
            'no-useless-concat': 'error',
            'no-useless-return': 'error',
            'no-void': 'error',
            'no-warning-comments': ['warn', { terms: ['todo'], location: 'start' }],
            'prefer-promise-reject-errors': 'error',
            'prefer-regex-literals': 'error',
            'require-await': 'error',
            'require-unicode-regexp': 'error',
            'vars-on-top': 'error',
            /* vars */
            yoda: 'error',
            'no-label-var': 'error',
            'no-undef-init': 'error',
            /* size */
            'max-depth': ['error', 4],
            'max-lines': ['error', { max: MAX_LINES, skipBlankLines: true, skipComments: true }],
            'max-nested-callbacks': ['error', 4],
            'max-params': ['error', 5],
            'no-array-constructor': 'error',
            'no-lonely-if': 'error',
            'no-object-constructor': 'error',
            /* ECMAScript 6 */
            'arrow-body-style': 'error',
            'no-duplicate-imports': 'error',
            'no-restricted-exports': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-rename': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'prefer-destructuring': [
                'error',
                {
                    VariableDeclarator: { array: false, object: true },
                    AssignmentExpression: { array: false, object: false }
                },
                { enforceForRenamedProperties: false }
            ],
            'prefer-numeric-literals': 'error',
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            'symbol-description': 'error',
            /* formatting rules, on the stylistic plugin since ESLint deprecates its own copies */
            '@stylistic/js/arrow-parens': ['error', 'as-needed'],
            '@stylistic/js/arrow-spacing': 'error',
            '@stylistic/js/comma-dangle': ['error', 'never'],
            '@stylistic/js/generator-star-spacing': 'error',
            '@stylistic/js/max-len': [
                'error',
                {
                    code: MAX_LINE_LENGTH,
                    ignorePattern: '^import |^export |eslint-disable',
                    ignoreRegExpLiterals: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreUrls: true
                }
            ],
            '@stylistic/js/multiline-ternary': ['error', 'always-multiline'],
            '@stylistic/js/no-extra-parens': ['error', 'functions'],
            '@stylistic/js/no-floating-decimal': 'error',
            '@stylistic/js/no-multi-spaces': 'error',
            '@stylistic/js/padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: 'directive', next: '*' },
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: 'block-like', next: '*' }
            ],
            '@stylistic/js/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/js/rest-spread-spacing': 'error',
            '@stylistic/js/semi': 'error',
            '@stylistic/js/template-curly-spacing': 'error',
            '@stylistic/js/wrap-iife': 'error',
            '@stylistic/js/yield-star-spacing': 'error',
            /* unicorn */
            'unicorn/better-regex': 'error',
            'unicorn/catch-error-name': 'error',
            /* off: flags every computed()/linkedSignal() class field as hoistable */
            'unicorn/consistent-function-scoping': 'off',
            'unicorn/custom-error-definition': 'error',
            'unicorn/error-message': 'error',
            'unicorn/escape-case': 'error',
            'unicorn/expiring-todo-comments': 'error',
            'unicorn/explicit-length-check': ['error', { 'non-zero': 'greater-than' }],
            'unicorn/filename-case': 'error',
            'unicorn/import-index': 'error',
            'unicorn/import-style': 'error',
            'unicorn/new-for-builtins': 'error',
            'unicorn/no-abusive-eslint-disable': 'error',
            'unicorn/no-console-spaces': 'error',
            'unicorn/no-for-loop': 'error',
            'unicorn/no-hex-escape': 'error',
            'unicorn/no-instanceof-array': 'error',
            'unicorn/no-keyword-prefix': 'error',
            'no-nested-ternary': 'error',
            'unicorn/no-nested-ternary': 'error',
            'unicorn/no-new-buffer': 'error',
            'unicorn/no-object-as-default-parameter': 'error',
            'unicorn/no-process-exit': 'error',
            'unicorn/no-unreadable-array-destructuring': 'error',
            'unicorn/no-unsafe-regex': 'error',
            'unicorn/no-unused-properties': 'error',
            'unicorn/no-useless-undefined': 'error',
            'unicorn/no-zero-fractions': 'error',
            'unicorn/number-literal-case': 'error',
            'unicorn/prefer-add-event-listener': 'error',
            'unicorn/prefer-array-find': 'error',
            'unicorn/prefer-array-flat-map': 'error',
            'unicorn/prefer-dom-node-append': 'error',
            'unicorn/prefer-dom-node-dataset': 'error',
            'unicorn/prefer-dom-node-remove': 'error',
            'unicorn/prefer-dom-node-text-content': 'error',
            'unicorn/prefer-includes': 'error',
            'unicorn/prefer-keyboard-event-key': 'error',
            'unicorn/prefer-modern-dom-apis': 'error',
            'unicorn/prefer-negative-index': 'error',
            'unicorn/prefer-number-properties': 'error',
            'unicorn/prefer-optional-catch-binding': 'error',
            'unicorn/prefer-query-selector': 'error',
            'unicorn/prefer-reflect-apply': 'error',
            'unicorn/prefer-set-has': 'error',
            'unicorn/prefer-spread': 'error',
            'unicorn/prefer-string-replace-all': 'error',
            'unicorn/prefer-string-slice': 'error',
            'unicorn/prefer-string-starts-ends-with': 'error',
            'unicorn/prefer-string-trim-start-end': 'error',
            'unicorn/prefer-type-error': 'error',
            'unicorn/prevent-abbreviations': 'error',
            'unicorn/string-content': 'error',
            'unicorn/throw-new-error': 'error',
            /* imports */
            'simple-import-sort/imports': 'error'
        }
    },
    {
        files: ['**/*.spec.ts'],
        rules: {
            'max-lines': ['error', { max: MAX_LINES_SPEC, skipBlankLines: true, skipComments: true }]
        }
    },
    {
        files: ['**/*.html'],
        extends: [...angular.configs.templateRecommended],
        rules: {
            '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }]
        }
    }
);
