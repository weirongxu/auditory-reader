// @ts-check
import { tsconfig } from '@raidou/eslint-config-react'
import { defineConfig, globalIgnores } from 'eslint/config'
export default defineConfig([
  globalIgnores(['src/bundle/**']),
  {
    files: [
      'src/{core,server,web}/**/*.{mjs,ts,tsx,js,jsx}',
      '*.{mjs,ts,tsx,js,jsx}',
    ],
    extends: [tsconfig],
    rules: {
      '@typescript-eslint/no-meaningless-void-operator': 'off',
      'no-undef': 'off',
    },
  },
])
