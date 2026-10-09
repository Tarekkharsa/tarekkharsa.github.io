import { get, route } from 'remix/routes'

export const routes = route({
  home: get('/'),
  post: get('/posts/:slug.html'),
  feed: get('/feed.xml'),
  sitemap: get('/sitemap.xml'),
})
