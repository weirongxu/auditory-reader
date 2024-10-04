import fs from 'fs'
import { createRequire } from 'module'
import { build } from 'esbuild'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'
import { clean } from 'esbuild-plugin-clean'

const require = createRequire(import.meta.url)

const jsdomPatchPlugin = {
  name: 'jsdom-patch',
  setup(build) {
    build.onLoad({ filter: /XMLHttpRequest-impl\.js$/ }, async (args) => {
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

console.log(`built jsdom`)
