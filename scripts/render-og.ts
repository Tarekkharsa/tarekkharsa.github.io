// Renders the social preview images for the lessons series with headless Chrome,
// from public/assets/og/og-series.html. Local only: CI never runs this, the PNGs are committed.
//
//   npm run og                 every series image
//   npm run og -- gtc-03       only images whose file name contains "gtc-03"
//
// Set CHROME to the browser binary when it isn't at the default macOS path.
import { execFileSync } from 'node:child_process'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'

import { LESSONS_PER_ROUND, rounds, series, seriesIndex } from '../app/content/posts.ts'

const rootDir = path.resolve(import.meta.dirname, '..')
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const template = pathToFileURL(path.join(rootDir, 'public/assets/og/og-series.html'))
const filter = process.argv[2]

const images = [
  {
    image: seriesIndex.image.path,
    k: series.name,
    t: 'Engineering lessons from great open-source repos',
    s: `${LESSONS_PER_ROUND} per codebase, every claim linked to the source`,
  },
  ...rounds.flatMap(({ codebase, lessons, finale }) => [
    ...lessons.map((lesson) => ({
      image: lesson.image.path,
      k: `${codebase.name} · lesson ${lesson.lesson} of ${LESSONS_PER_ROUND} · ${lesson.tag}`,
      t: lesson.title,
      s: lesson.subtitle,
    })),
    {
      image: finale.image.path,
      k: `${codebase.name} · power-user tips`,
      t: finale.title,
      s: finale.subtitle,
    },
  ]),
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
