// Serves the built dist/ folder the way GitHub Pages does, to check a build locally:
// files as-is, /posts/<slug> from posts/<slug>.html, and 404.html for anything missing.
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import * as http from 'node:http'
import * as path from 'node:path'
import { staticFiles } from 'remix/middleware/static'
import { createRequestListener } from 'remix/node-fetch-server'
import { createRouter } from 'remix/router'

const distDir = path.resolve(import.meta.dirname, '..', 'dist')
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44101

const html = async (file: string, status = 200) =>
  new Response(await readFile(file), {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })

const router = createRouter({
  middleware: [staticFiles(distDir)],
  async defaultHandler({ url }) {
    // Pages serves foo.html for /foo when no file or directory named foo exists.
    let file = path.join(distDir, `${decodeURIComponent(url.pathname)}.html`)
    if (file.startsWith(distDir + path.sep) && existsSync(file)) return html(file)
    return html(path.join(distDir, '404.html'), 404)
  },
})

http.createServer(createRequestListener(router.fetch)).listen(port, () => {
  console.log(`Previewing dist/ on http://localhost:${port}`)
})
