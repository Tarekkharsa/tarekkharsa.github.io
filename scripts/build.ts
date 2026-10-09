// Prerenders the site into dist/ for GitHub Pages.
//
// GitHub Pages only serves files, so instead of running the Remix server we ask the router
// for every page once at build time and save each response next to the copied public/ files.
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { parseArgs } from 'node:util'

import { site } from '../app/site.ts'
import { staticPages } from '../app/static-pages.ts'
import { router } from '../app/router.tsx'

const rootDir = path.resolve(import.meta.dirname, '..')
const { values } = parseArgs({
  options: { outDir: { type: 'string', default: path.join(rootDir, 'dist') } },
})
const outDir = path.resolve(values.outDir!)

await fs.rm(outDir, { recursive: true, force: true })
await fs.cp(path.join(rootDir, 'public'), outDir, { recursive: true })

for (let page of staticPages()) {
  let response = await router.fetch(new Request(new URL(page.path, site.origin)))
  if (response.status !== page.status) {
    throw new Error(`${page.path}: expected HTTP ${page.status}, got ${response.status}`)
  }
  let file = path.join(outDir, page.file)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, await response.text())
  console.log(`${page.path} -> ${path.relative(rootDir, file)}`)
}
