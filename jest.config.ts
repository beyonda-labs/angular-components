import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  // Ajusta si tu lib vive en /src o en /projects/...
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

  // Opcional: ignora build output
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/public-api.ts',
    '!src/**/*.module.ts'
  ]
};

export default config;
