import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Enforce `type` over `interface`
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      // One component per file (icons.tsx is the only exception)
      'react/no-multi-comp': ['error', { ignoreStateless: false }],

      // Enforce `export type` for type-only imports/exports
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // Exception: icons.tsx may have multiple small SVG components
    files: ['src/components/shared/icons.tsx'],
    rules: {
      'react/no-multi-comp': 'off',
    },
  },
];
