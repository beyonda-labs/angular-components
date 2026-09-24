import type { Config } from 'jest';

const config: Config = {
    preset: 'jest-preset-angular',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

    roots: ['<rootDir>/src'],
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

    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],

    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/public-api.ts', '!src/**/*.module.ts'],

    coverageThreshold: {
        global: {
            statements: 80,
            branches: 67,
            functions: 74,
            lines: 80
        }
    }
};

export default config;
