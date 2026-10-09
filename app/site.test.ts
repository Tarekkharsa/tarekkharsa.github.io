import * as fs from 'node:fs'
import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { postPath, posts, roundPosts, rounds, t3CodeServerGuide } from './content/posts.ts'
import { piRound } from './content/rounds/pi.ts'
import { t3codeRound } from './content/rounds/t3code.ts'
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

const { lessons } = t3codeRound

describe('Guess the codebase series', () => {
  it('accumulates hints from earlier lessons in the same round only', async () => {
    let { body } = await get(postPath(t3codeRound.lessons[3]!))
    assert.match(body, /\+ 9 hints from earlier lessons/)
    assert.match(body, /Hint E9/)
    assert.doesNotMatch(body, /Hint E10/)

    let first = (await get(postPath(piRound.lessons[0]!))).body
    assert.doesNotMatch(first, /hints from earlier lessons/)
    let last = (await get(postPath(piRound.lessons[7]!))).body
    assert.match(last, /\+ 21 hints from earlier lessons/)
    assert.ok(!last.includes(t3codeRound.lessons[0]!.hints[0]), 'round 1 hints leaked into round 2')
  })

  it('keeps every reveal out of the feed and sitemap, and lists every lesson', async () => {
    for (let path of ['/feed.xml', '/sitemap.xml']) {
      let { body } = await get(path)
      for (let round of rounds) {
        assert.doesNotMatch(body, new RegExp(round.finale.slug), path)
        for (let lesson of round.lessons) assert.match(body, new RegExp(lesson.slug), path)
      }
    }
  })

  it('links each page to its neighbors within its round', async () => {
    for (let round of rounds) {
      let { body } = await get(postPath(round.lessons.at(-1)!))
      let next = body.match(/<a [^>]*class="next"[^>]*>/)?.[0] ?? ''
      assert.match(next, new RegExp(`href="${postPath(round.finale)}"`), `round ${round.number}`)
    }
  })

  it("shows only the current round's pages in the series nav", async () => {
    let { body } = await get(postPath(piRound.lessons[2]!))
    let nav = body.match(/<nav [^>]*class="series-nav"[\s\S]*?<\/nav>/)?.[0] ?? ''
    assert.match(nav, /round 2/)
    for (let page of roundPosts(piRound)) assert.match(nav, new RegExp(postPath(page)))
    for (let page of roundPosts(t3codeRound)) assert.doesNotMatch(nav, new RegExp(postPath(page)))
  })

  it("points each lesson's answer at its own round's repo", async () => {
    for (let round of rounds) {
      let { body } = await get(postPath(round.lessons[0]!))
      let answer = body.match(/<div class="answer">[\s\S]*?<\/div>/)?.[0] ?? ''
      assert.match(answer, new RegExp(`href="${round.answer.url}"`), `round ${round.number}`)
      for (let other of rounds.filter((candidate) => candidate !== round)) {
        assert.doesNotMatch(answer, new RegExp(other.answer.repo), `round ${round.number}`)
      }
    }
  })

  it('lists every round on the hub, newest first', async () => {
    let { body } = await get('/posts/guess-the-codebase')
    let positions = rounds.map((round) => body.indexOf(`id="round-${round.number}"`))
    assert.ok(positions.every((position) => position > 0))
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b))
  })

  it('has a social image for every post', () => {
    let missing = posts.filter((post) => !fs.existsSync(new URL(`.${post.image.path}`, publicDir)))
    assert.deepEqual(missing.map((post) => post.slug), [])
  })

  it("keeps the answer out of every URL a player sees before the reveal", () => {
    for (let round of rounds.filter((candidate) => candidate.number > 1)) {
      let name = round.answer.name.toLowerCase()
      for (let page of roundPosts(round)) {
        assert.ok(!page.slug.split('-').includes(name), `${page.slug} contains "${name}"`)
      }
    }
  })

  it('never changes round 1 URLs, which are already shared', () => {
    assert.deepEqual(roundPosts(t3codeRound).map(postPath), [
      '/posts/gtc-01-decide-commit-then-act',
      '/posts/gtc-02-performance-budgets-as-tests',
      '/posts/gtc-03-mock-the-boundary',
      '/posts/gtc-04-pr-process-for-the-ai-era',
      '/posts/gtc-05-taste-as-lint-rules',
      '/posts/gtc-06-dev-setup-for-parallel-agents',
      '/posts/gtc-07-honest-ui',
      '/posts/gtc-08-write-docs-for-agents',
      '/posts/gtc-reveal-t3-code-power-user-tips',
    ])
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
