import * as fs from 'node:fs'
import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { finale, lessons, postPath, posts } from './content/posts.ts'
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

describe('404', () => {
  it('renders the not-found page for unknown posts', async () => {
    let { response, body } = await get('/posts/does-not-exist.html')
    assert.equal(response.status, 404)
    assert.match(body, /404: not found/)
    assert.match(body, /<meta name="robots" content="noindex"/)
  })
})
