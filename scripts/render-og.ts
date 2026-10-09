// Renders the social preview images for the Guess the codebase series with headless Chrome,
// from public/assets/og/og-series.html. Local only: CI never runs this, the PNGs are committed.
//
//   npm run og                 every series image
//   npm run og -- gtc-03       only images whose file name contains "gtc-03"
//
// Set CHROME to the browser binary when it isn't at the default macOS path.
import { execFileSync } from 'node:child_process'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'

import { finale, lessons, series, seriesIndex } from '../app/content/posts.ts'

const rootDir = path.resolve(import.meta.dirname, '..')
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const template = pathToFileURL(path.join(rootDir, 'public/assets/og/og-series.html'))
const filter = process.argv[2]

const images = [
  { image: seriesIndex.image.path, k: series.hashtag, t: '8 engineering lessons from one open-source repo', s: 'Can you guess which one?' },
  ...lessons.map((lesson) => ({
    image: lesson.image.path,
    k: `${series.hashtag} · lesson ${lesson.lesson} of ${lessons.length} · ${lesson.tag}`,
    t: lesson.title,
    s: 'Guess which open-source repo I learned this from',
  })),
  { image: finale.image.path, k: `${series.hashtag} · the reveal`, t: `It was ${series.answer.name}.`, s: '8 lessons + 30 power-user tips' },
]

for (let { image, k, t, s } of images) {
  if (filter && !image.includes(filter)) continue
  let url = new URL(template)
  url.search = new URLSearchParams({ k, t, s }).toString()
  execFileSync(chrome, [
    '--headless=new',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=2000',
    `--screenshot=${path.join(rootDir, 'public', image)}`,
    url.href,
  ], { stdio: 'ignore' })
  console.log(`rendered public${image}`)
}
