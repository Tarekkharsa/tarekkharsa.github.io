import { createController } from 'remix/router'

import { findPost, movedPosts, postPath } from '../content/posts.ts'
import { atomFeed, sitemap } from '../feeds.ts'
import { HomePage } from '../pages/home-page.tsx'
import { MovedPage } from '../pages/moved-page.tsx'
import { NotFoundPage } from '../pages/not-found-page.tsx'
import { PostPage } from '../pages/post-page.tsx'
import { SeriesPage } from '../pages/series-page.tsx'
import { routes } from '../routes.ts'

const xmlHeaders = (type: string) => ({ 'Content-Type': `${type}; charset=utf-8` })

export default createController(routes, {
  actions: {
    home(context) {
      return context.render(<HomePage />)
    },
    post(context) {
      let post = findPost(context.params.slug)
      let moved = movedPosts[context.params.slug]
      if (post == null && moved != null) return context.render(<MovedPage to={findPost(moved)!} />)
      if (post == null) return context.render(<NotFoundPage />, { status: 404 })
      if (post.kind === 'series') return context.render(<SeriesPage />)
      return context.render(<PostPage post={post} />)
    },
    legacyPost(context) {
      let post = findPost(movedPosts[context.params.slug] ?? context.params.slug)
      if (post == null) return context.render(<NotFoundPage />, { status: 404 })
      return Response.redirect(new URL(postPath(post), context.url), 301)
    },
    feed() {
      return new Response(atomFeed(), { headers: xmlHeaders('application/atom+xml') })
    },
    sitemap() {
      return new Response(sitemap(), { headers: xmlHeaders('application/xml') })
    },
  },
})
