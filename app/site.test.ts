import * as fs from 'node:fs'
import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { finale, lessons, postPath, posts, t3CodeServerGuide } from './content/posts.ts'
import { router } from './router.tsx'
import { site } from './site.ts'
import { staticPages } from './static-pages.ts'

const publicDir = new URL('../public/', import.meta.url)

async function get(path: string) {
  let response = await router.fetch(new Request(new URL(path, site.origin)))
  return { response, body: await response.text() }
}

describe('static build', () => {
  it('renders every page with the expected status', async () => {
    for (let page of staticPages()) {
      let { response } = await get(page.path)
      assert.equal(response.status, page.status, page.path)
    }
  })

  it('has a content file for every post and a post for every content file', () => {
    let files = fs.readdirSync(new URL('../content/posts/', import.meta.url)).sort()
    let slugs = posts.map((post) => `${post.slug}.html`).sort()
    assert.deepEqual(files, slugs)
  })

  it('only links to pages and files that exist', async () => {
    let built = new Set(staticPages().map((page) => page.path))
    let broken: string[] = []

    for (let page of staticPages()) {
      if (!page.file.endsWith('.html')) continue
      let { body } = await get(page.path)
      for (let [, href] of body.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
        let url = new URL(href, new URL(page.path, site.origin))
        if (url.origin !== site.origin) continue
        let exists =
          built.has(url.pathname) || fs.existsSync(new URL(`.${url.pathname}`, publicDir))
        if (!exists) broken.push(`${page.path} -> ${href}`)
      }
    }

    assert.deepEqual(broken, [])
  })
})

describe('Guess the codebase series', () => {
  it('accumulates hints from earlier lessons', async () => {
    let { body } = await get(postPath(lessons[3]!))
    assert.match(body, /\+ 9 hints from earlier lessons/)
    assert.match(body, /Hint E9/)
    assert.doesNotMatch(body, /Hint E10/)
  })

  it('keeps the reveal out of the feed and sitemap', async () => {
    for (let path of ['/feed.xml', '/sitemap.xml']) {
      let { body } = await get(path)
      assert.doesNotMatch(body, new RegExp(finale.slug), path)
      for (let lesson of lessons) assert.match(body, new RegExp(lesson.slug), path)
    }
  })

  it('links each page to its neighbors', async () => {
    let { body } = await get(postPath(lessons.at(-1)!))
    let next = body.match(/<a [^>]*class="next"[^>]*>/)?.[0] ?? ''
    assert.match(next, new RegExp(`href="${postPath(finale)}"`))
  })
})

describe('analytics', () => {
  it('loads GoatCounter once on every page', async () => {
    for (let page of staticPages()) {
      if (!page.file.endsWith('.html')) continue
      let { body } = await get(page.path)
      let tags = body.match(/<script data-goatcounter="[^"]*"[^>]*>/g) ?? []
      assert.equal(tags.length, 1, page.path)
      assert.match(tags[0]!, new RegExp(`data-goatcounter="${site.analytics.endpoint}"`), page.path)
      assert.match(tags[0]!, /\basync\b/, page.path)
    }
  })

  it('marks every article for read tracking, and nothing else', async () => {
    for (let post of posts) {
      let { body } = await get(postPath(post))
      let article = body.match(/<article[^>]*>/)?.[0]
      if (post.kind === 'series') {
        assert.equal(article, undefined, post.slug)
        continue
      }
      assert.match(article ?? '', new RegExp(`data-read-slug="${post.slug}"`), post.slug)
      assert.match(article ?? '', new RegExp(`data-read-minutes="${post.readMinutes}"`), post.slug)
    }
  })
})

describe('updated posts', () => {
  it('show the update date and use it as the modified date', async () => {
    let { body } = await get(postPath(t3CodeServerGuide))
    assert.match(body, /Updated <time datetime="2026-10-09">/)
    assert.match(body, /"dateModified": ?"2026-10-09T00:00:00Z"/)
    assert.match(body, /"datePublished": ?"2026-09-28T00:00:00Z"/)

    let feed = (await get('/feed.xml')).body
    let entry = feed.slice(feed.indexOf(t3CodeServerGuide.slug))
    assert.match(entry, /<published>2026-09-28T00:00:00Z<\/published>\s*<updated>2026-10-09T00:00:00Z<\/updated>/)
  })
})

describe('clean post URLs', () => {
  it('uses /posts/<slug> everywhere, written to posts/<slug>.html', async () => {
    let post = lessons[0]!
    let page = staticPages().find((entry) => entry.path === postPath(post))
    assert.equal(page?.file, `posts/${post.slug}.html`)
    let { body } = await get(postPath(post))
    assert.match(body, new RegExp(`<link rel="canonical" href="${site.origin}/posts/${post.slug}"`))
    assert.doesNotMatch(body, /href="[^"]*\/posts\/[^"]*\.html"/)
  })

  it('moves the old .html URL in the address bar to the clean one', async () => {
    let { body } = await get(postPath(lessons[0]!))
    assert.match(body, /history\.replaceState/)
    assert.doesNotMatch((await get('/')).body, /history\.replaceState/)
  })

  it('redirects old .html URLs in dev', async () => {
    let { response } = await get(`/posts/${lessons[0]!.slug}.html`)
    assert.equal(response.status, 301)
    assert.equal(response.headers.get('Location'), `${site.origin}${postPath(lessons[0]!)}`)
  })

  it('keeps feed entry IDs on the original URLs so readers see no duplicates', async () => {
    let { body } = await get('/feed.xml')
    assert.match(body, new RegExp(`<link href="${site.origin}/posts/${lessons[0]!.slug}"/>`))
    assert.match(body, new RegExp(`<id>${site.origin}/posts/${lessons[0]!.slug}\\.html</id>`))
  })
})

describe('404', () => {
  it('renders the not-found page for unknown posts', async () => {
    for (let path of ['/posts/does-not-exist', '/posts/does-not-exist.html']) {
      let { response, body } = await get(path)
      assert.equal(response.status, 404, path)
      assert.match(body, /404: not found/)
    }
    let { body } = await get('/posts/does-not-exist')
    assert.match(body, /<meta name="robots" content="noindex"/)
  })
})
