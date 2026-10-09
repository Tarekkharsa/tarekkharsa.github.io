import { get, route } from 'remix/routes'

export const routes = route({
  home: get('/'),
  post: get('/posts/:slug'),
  // Old URLs from before clean URLs. Pages serves posts/<slug>.html at both paths;
  // in dev this redirects so links behave the same.
  legacyPost: get('/posts/:slug.html'),
  feed: get('/feed.xml'),
  sitemap: get('/sitemap.xml'),
})
