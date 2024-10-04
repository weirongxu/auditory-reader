import { defineConfig } from '@rsbuild/core'
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
      js: '',
      jsAsync: '',
    },
    assetPrefix: appPublicPath,
    externals: {
      jsdom: 'jsdom',
    },
  },
  html: {
    meta: {
      charset: {
        charset: 'utf-8',
      },
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
      ignoreWarnings: [
        /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      ],
    },
  },
  server: {
    proxy: isServer
      ? {
          context: ['/api'],
          target: 'http://localhost:4001',
        }
      : undefined,
  },
})
