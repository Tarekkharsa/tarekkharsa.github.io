import { fileURLToPath } from 'node:url'
import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'
import { createController, createRouter, type MiddlewareContext } from 'remix/router'

import { findPost } from './content/posts.ts'
import { atomFeed, sitemap } from './feeds.ts'
import { HomePage } from './pages/home-page.tsx'
import { NotFoundPage } from './pages/not-found-page.tsx'
import { PostPage } from './pages/post-page.tsx'
import { SeriesPage } from './pages/series-page.tsx'
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

const xmlHeaders = (type: string) => ({ 'Content-Type': `${type}; charset=utf-8` })

router.map(
  routes,
  createController(routes, {
    actions: {
      home(context) {
        return context.render(<HomePage />)
      },
      post(context) {
        let post = findPost(context.params.slug)
        if (post == null) return context.render(<NotFoundPage />, { status: 404 })
        if (post.kind === 'series') return context.render(<SeriesPage />)
        return context.render(<PostPage post={post} />)
      },
      feed() {
        return new Response(atomFeed(), { headers: xmlHeaders('application/atom+xml') })
      },
      sitemap() {
        return new Response(sitemap(), { headers: xmlHeaders('application/xml') })
      },
    },
  }),
)
