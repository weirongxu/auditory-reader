import { config } from '@raidou/oxlint-config-base'
import { defineConfig } from 'oxlint'

export default defineConfig({
  env: { builtin: true, node: true, browser: true },
  // Keep generated bundle output out of lint scope
  ignorePatterns: [
    'src/bundle/**',
    'lib/**',
    'sw-public/**',
    'server-public/**',
    'node_modules/**',
  ],
  extends: [config],
  rules: {
    // Kept from the previous ESLint config: async handlers intentionally return void promises
    'typescript/no-meaningless-void-operator': 'off',
    // Kept from the previous ESLint config: TS compiler already catches undefined globals
    'no-undef': 'off',
    // Not enabled by the previous ESLint config; lists here render in a fixed order where
    // the array index is the stable identity of each item
    'react/no-array-index-key': 'off',
  },
})
