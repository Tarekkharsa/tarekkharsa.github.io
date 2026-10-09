import * as fs from 'node:fs'
import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { postUrl, posts } from '../app/content/posts.ts'
import { site } from '../app/site.ts'
import { allTweets, linksIn, renderKit, TWEET_LIMIT, tweetLength, type TweetKit } from './kit.ts'

const projectsDir = new URL('./', import.meta.url)

async function loadKits(): Promise<TweetKit[]> {
  let kits: TweetKit[] = []
  for (let entry of fs.readdirSync(projectsDir, { withFileTypes: true })) {
    let file = new URL(`${entry.name}/tweets.ts`, projectsDir)
    if (entry.isDirectory() && fs.existsSync(file)) kits.push((await import(file.href)).kit)
  }
  return kits
}

describe('tweet kits', () => {
  it('counts links the way X does', () => {
    assert.equal(tweetLength('hi https://example.com/a/very/long/path/that/goes/on'), 3 + 23)
    assert.equal(tweetLength('🕵️'), 2)
  })

  it('keeps every tweet within the limit', async () => {
    let tooLong = (await loadKits()).flatMap((kit) =>
      allTweets(kit)
        .filter((tweet) => tweetLength(tweet.text) > TWEET_LIMIT)
        .map((tweet) => `${kit.project}: ${tweet.section} / ${tweet.label} (${tweetLength(tweet.text)})`),
    )
    assert.deepEqual(tooLong, [])
  })

  it('only links to posts that exist on the site', async () => {
    let known = new Set(posts.map((post) => postUrl(post)))
    let broken = (await loadKits()).flatMap((kit) =>
      [kit.hub, ...allTweets(kit).flatMap((tweet) => linksIn(tweet.text))]
        .filter((link) => link.startsWith(site.origin) && !known.has(link))
        .map((link) => `${kit.project}: ${link}`),
    )
    assert.deepEqual(broken, [])
  })

  it('has a committed tweet-kit.html that matches its source', async () => {
    for (let kit of await loadKits()) {
      let file = new URL(`${kit.project}/tweet-kit.html`, projectsDir)
      assert.ok(fs.existsSync(file), `run: npm run kit -- ${kit.project}`)
      assert.equal(fs.readFileSync(file, 'utf8'), renderKit(kit), `stale kit, run: npm run kit -- ${kit.project}`)
    }
  })
})
