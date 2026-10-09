// Renders projects/<name>/tweet-kit.html from projects/<name>/tweets.ts.
//
//   npm run kit              every project that has a tweets.ts
//   npm run kit -- t3code    one project
//
// Fails if any tweet is over X's limit, so a kit is always ready to paste.
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { allTweets, renderKit, TWEET_LIMIT, tweetLength, type TweetKit } from '../projects/kit.ts'

const projectsDir = path.resolve(import.meta.dirname, '..', 'projects')
const requested = process.argv.slice(2)
const projects = requested.length > 0 ? requested : await projectsWithKits()

for (let project of projects) {
  let { kit } = (await import(path.join(projectsDir, project, 'tweets.ts'))) as { kit: TweetKit }
  let tooLong = allTweets(kit).filter((tweet) => tweetLength(tweet.text) > TWEET_LIMIT)
  if (tooLong.length > 0) {
    for (let tweet of tooLong) {
      console.error(`${project}: "${tweet.section}" / ${tweet.label} is ${tweetLength(tweet.text)} characters`)
    }
    process.exitCode = 1
    continue
  }
  let file = path.join(projectsDir, project, 'tweet-kit.html')
  await fs.writeFile(file, renderKit(kit))
  console.log(`${project}: ${allTweets(kit).length} tweets -> ${path.relative(process.cwd(), file)}`)
}

async function projectsWithKits(): Promise<string[]> {
  let entries = await fs.readdir(projectsDir, { withFileTypes: true })
  let found: string[] = []
  for (let entry of entries) {
    if (!entry.isDirectory()) continue
    let exists = await fs.access(path.join(projectsDir, entry.name, 'tweets.ts')).then(() => true, () => false)
    if (exists) found.push(entry.name)
  }
  return found.sort()
}
