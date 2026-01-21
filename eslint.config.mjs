// @ts-check
import { tsconfig } from '@raidou/eslint-config-react'
import { defineConfig } from 'eslint/config'

export default defineConfig(tsconfig, {
  ignores: ['node_modules', 'lib', 'src/bundle'],
})
