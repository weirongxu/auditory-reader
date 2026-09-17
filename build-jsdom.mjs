// @ts-check
import { build } from 'esbuild'
import { clean } from 'esbuild-plugin-clean'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'
import fs from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

/** @type {import('esbuild').Plugin} */
const jsdomPatchPlugin = {
  name: 'jsdom-patch',
  setup(pluginBuild) {
    pluginBuild.onLoad({ filter: /XMLHttpRequest-impl\.js$/ }, async (args) => {
      let contents = await fs.promises.readFile(args.path, 'utf8')
      contents = contents.replace(
        'const syncWorkerFile = require.resolve ? require.resolve("./xhr-sync-worker.js") : null;',
        `const syncWorkerFile = "${require.resolve('jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js')}";`,
      )
      return { contents, loader: 'js' }
    })
  },
}

await build({
  entryPoints: ['src/web/jsdom.js'],
  entryNames: '[name]',
  outdir: 'src/bundle',
  platform: 'browser',
  bundle: true,
  external: ['canvas'],
  plugins: [
    polyfillNode(),
    clean({
      patterns: ['src/bundle'],
    }),
    jsdomPatchPlugin,
  ],
})

// eslint-disable-next-line no-console -- build script, useful progress output
console.debug(`built jsdom`)
