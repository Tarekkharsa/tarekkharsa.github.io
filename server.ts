// Local development server: renders pages on request (the router also serves public/).
// Production is the static build in dist/ (see scripts/build.ts).
import * as http from 'node:http'
import { createRequestListener } from 'remix/node-fetch-server'

import { router } from './app/router.tsx'

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44100
const server = http.createServer(createRequestListener(router.fetch))

server.listen(port, () => {
  console.log(`Dev server listening on http://localhost:${port}`)
})

let shuttingDown = false
function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  server.close(() => process.exit(0))
  server.closeAllConnections()
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
