import { defineConfig, rspack } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSass } from '@rsbuild/plugin-sass'

const env = process.env
const appMode = env.APP_MODE
const isServer = appMode === 'server'
const appPublicPath = env.APP_PUBLIC_PATH

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  source: {
    include: ['./src'],
    entry: {
      index: './src/web/index.tsx',
    },
    define: {
      'process.env.APP_MODE': JSON.stringify(appMode),
      'process.env.APP_PUBLIC_PATH': JSON.stringify(appPublicPath),
    },
  },
  output: {
    distPath: {
      root: isServer ? 'server-public' : 'sw-public',
    },
  },
  html: {
    meta: {
      charset: 'utf-8',
      viewport:
        'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1',
    },
    title: 'Auditory Reader',
  },
  tools: {
    rspack: {
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        extensionAlias: { '.js': ['.js', '.ts', '.tsx'] },
        alias: {
          path: '@file-services/path',
        },
        fallback: {
          fs: false,
          buffer: false,
        },
      },
      plugins: [
        new rspack.IgnorePlugin({
          resourceRegExp: /jsdom/,
        }),
      ],
    },
  },
  server: {
    proxy: {
      context: ['/api'],
      target: 'http://localhost:4001',
    },
  },
})
