import type { Config } from 'jest';

const config: Config = {
    preset: 'jest-preset-angular',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

    roots: ['<rootDir>/src', '<rootDir>/style-guide', '<rootDir>/testing'],
    testMatch: ['**/?(*.)+(spec).ts'],

    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$'
            }
        ]
    },

    moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],

    moduleNameMapper: {
        '^@beyonda-labs/angular-components$': '<rootDir>/src/public-api.ts',
        '^@beyonda-labs/angular-components/style-guide$': '<rootDir>/style-guide/src/public-api.ts',
        '^@testing/(.*)$': '<rootDir>/testing/$1'
    },

    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],

    collectCoverageFrom: [
        'src/**/*.ts',
        'style-guide/src/**/*.ts',
        '!**/*.spec.ts',
        '!**/public-api.ts',
        '!**/*.module.ts'
    ],

    coverageThreshold: {
        global: {
            statements: 90,
            branches: 77,
            functions: 85,
            lines: 90
        }
    }
};

export default config;
