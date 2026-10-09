import { postPath, posts } from './content/posts.ts'
import { routes } from './routes.ts'

export interface StaticPage {
  /** URL path requested from the router. */
  path: string
  /** Output file, relative to dist/. */
  file: string
  /** Expected response status. */
  status: number
}

/** Every file the build writes, and the URL that produces it. */
export function staticPages(): StaticPage[] {
  return [
    { path: routes.home.href(), file: 'index.html', status: 200 },
    // Written as posts/<slug>.html: GitHub Pages serves it at /posts/<slug> (the canonical URL)
    // and at the old /posts/<slug>.html, so links shared before clean URLs keep working.
    ...posts.map((post) => ({ path: postPath(post), file: `posts/${post.slug}.html`, status: 200 })),
    { path: routes.feed.href(), file: 'feed.xml', status: 200 },
    { path: routes.sitemap.href(), file: 'sitemap.xml', status: 200 },
    // GitHub Pages serves /404.html for any missing path.
    { path: '/404.html', file: '404.html', status: 404 },
  ]
}
