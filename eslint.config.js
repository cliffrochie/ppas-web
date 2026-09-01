import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importX from 'eslint-plugin-import-x'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '@']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      'import-x/resolver': {
        typescript: { project: './tsconfig.app.json' },
      },
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Bulletproof React import order (blueprint/dev-guidelines/frontend.md):
      // builtin -> external -> internal (@/) -> parent -> sibling -> index.
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'ignore',
        },
      ],
      'import-x/no-duplicates': 'error',
      'import-x/no-cycle': ['error', { maxDepth: 3 }],
      // TS resolves these; import-x's own resolution is redundant and noisy.
      'import-x/no-unresolved': 'off',
      'import-x/namespace': 'off',
      // Fires on legit default imports (DOMPurify, tiptap extensions) that also
      // ship a same-named named export.
      'import-x/no-named-as-default': 'off',
    },
  },

  // Unidirectional architecture — cross-feature imports must go through the
  // feature's public barrel (@/features/<name>), never its internals.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Import from the feature public barrel (@/features/<name>), not its internals.',
            },
          ],
        },
      ],
    },
  },

  // Shared modules must not depend on features or the app layer. Layout shells
  // (components/layouts) are the app-shell composition boundary and may pull a
  // feature's barrel (logout action, notification bell) — a documented deviation.
  {
    files: [
      'src/lib/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/utils/**/*.{ts,tsx}',
      'src/stores/**/*.{ts,tsx}',
      'src/config/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
      'src/components/ui/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/features/*/*', '@/app/*', '@/app/*/*'],
              message: 'Shared modules must not import from features or app.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/testing/**', 'src/app/router.tsx', 'src/components/ui/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
