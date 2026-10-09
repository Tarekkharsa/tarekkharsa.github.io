import { fileURLToPath } from 'node:url'
import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'
import { createRouter, type MiddlewareContext } from 'remix/router'

import controller from './actions/controller.tsx'
import { NotFoundPage } from './pages/not-found-page.tsx'
import { routes } from './routes.ts'

const renderMiddleware = render()
type AppContext = MiddlewareContext<[typeof renderMiddleware]>

declare module 'remix' {
  interface RouterTypes {
    context: AppContext
  }
}

/**
 * The whole site as a fetch router. `server.ts` serves it locally; `scripts/build.ts`
 * requests every route once and writes the responses to dist/ for GitHub Pages.
 */
export const router = createRouter<AppContext>({
  middleware: [
    // Serves favicon, CSS, JS and images during development. The build copies public/ instead.
    staticFiles(fileURLToPath(new URL('../public', import.meta.url)), { index: false }),
    renderMiddleware,
  ],
  defaultHandler(context) {
    return context.render(<NotFoundPage />, { status: 404 })
  },
})

router.map(routes, controller)
