import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // shadcn/ui generates these files via `npx shadcn add ...` and, by its
    // own convention, co-locates small cva() variant helpers (e.g.
    // `buttonVariants`) with the component that uses them. That's a false
    // positive for react-refresh/only-export-components, not a real bug —
    // splitting every shadcn primitive into two files would fight the CLI
    // on every future `shadcn add`/`shadcn diff` run. Every shadcn project
    // disables this rule for exactly this folder.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
])