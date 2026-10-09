// Serves the built dist/ folder the way GitHub Pages does, to check a build locally.
import * as http from 'node:http'
import * as path from 'node:path'
import { staticFiles } from 'remix/middleware/static'
import { createRequestListener } from 'remix/node-fetch-server'
import { createRouter } from 'remix/router'

const distDir = path.resolve(import.meta.dirname, '..', 'dist')
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44101
const notFound = path.join(distDir, '404.html')

const router = createRouter({
  middleware: [staticFiles(distDir)],
  async defaultHandler() {
    let { readFile } = await import('node:fs/promises')
    return new Response(await readFile(notFound), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  },
})

http.createServer(createRequestListener(router.fetch)).listen(port, () => {
  console.log(`Previewing dist/ on http://localhost:${port}`)
})
