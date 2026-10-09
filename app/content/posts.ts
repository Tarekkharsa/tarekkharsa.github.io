import * as fs from 'node:fs'

import { absoluteUrl, site } from '../site.ts'

/**
 * Every page under /posts/ is registered here. The prose body of each post lives in
 * content/posts/<slug>.html; everything around it (head tags, series navigation, hints,
 * pager, share buttons, feed and sitemap entries) is generated from this metadata.
 */

interface BasePost {
  slug: string
  /** Used for <title>, og:title and twitter:title. */
  title: string
  /** On-page <h1>, when it differs from `title`. */
  heading?: string
  description: string
  subtitle: string
  /** Publication date, YYYY-MM-DD. */
  date: string
  /** Last meaningful content update, YYYY-MM-DD. Shown in the header and used as dateModified. */
  updated?: string
  tag: string
  readMinutes?: number
  image: { path: string; alt: string }
  /** Text for the "Post on X" share button. */
  shareText: string
  /** Listed in feed.xml and sitemap.xml. */
  indexed: boolean
  feed?: { title: string; summary: string }
  /** Shown in the home page "Writing" list. */
  listing?: { tag: string; title: string; summary: string }
}

export interface GuidePost extends BasePost {
  kind: 'guide'
  /** JSON-LD headline, when it differs from `title`. */
  headline?: string
}

export interface SeriesIndexPost extends BasePost {
  kind: 'series'
}

export interface LessonPost extends BasePost {
  kind: 'lesson'
  lesson: number
  hints: [string, string, string]
  /** Paths in the answer repo, shown when the reader gives up. */
  sources: string[]
}

export interface FinalePost extends BasePost {
  kind: 'finale'
}

export type Post = GuidePost | SeriesIndexPost | LessonPost | FinalePost
export type SeriesPost = LessonPost | FinalePost

export const series = {
  slug: 'guess-the-codebase',
  name: 'Guess the codebase',
  hashtag: '#GuessTheCodebase',
  answer: {
    name: 'T3 Code',
    repo: 'pingdotgg/t3code',
    url: 'https://github.com/pingdotgg/t3code',
    blobBase: 'https://github.com/pingdotgg/t3code/blob/main/',
    blurb: 'the open-source GUI for coding agents',
  },
} as const

interface LessonInput {
  slug: string
  lesson: number
  title: string
  subtitle: string
  tag: string
  readMinutes: number
  hints: [string, string, string]
  sources: string[]
}

const LESSON_COUNT = 8
const SERIES_DATE = '2026-10-09'

function lesson(input: LessonInput): LessonPost {
  let n = input.lesson
  return {
    ...input,
    kind: 'lesson',
    description: `${input.subtitle} Lesson ${n} of ${LESSON_COUNT} in ${series.hashtag}: can you guess which open-source repo it came from?`,
    date: SERIES_DATE,
    image: {
      path: `/assets/og/gtc-0${n}.png`,
      alt: `Guess the codebase, lesson ${n}: ${input.title}`,
    },
    shareText: `Lesson ${n} of ${series.hashtag}: ${input.title}. Can you guess which open-source repo it came from?`,
    indexed: true,
    feed: { title: `Guess the codebase #${n}: ${input.title}`, summary: input.subtitle },
  }
}

export const lessons: LessonPost[] = [
  lesson({
    slug: 'gtc-01-decide-commit-then-act',
    lesson: 1,
    title: 'Decide, commit, then act',
    subtitle:
      'The three-step server pattern that keeps AI agents from leaving your app in a weird state.',
    tag: 'Architecture',
    readMinutes: 2,
    hints: [
      "It's open source and has over 400,000 users.",
      'The same server drives a web app, a desktop app and a mobile app.',
      'Its server is event-sourced and written in TypeScript.',
    ],
    sources: [
      'docs/internals/overview.md',
      'apps/server/src/orchestration-v2/Orchestrator.ts',
      'apps/server/src/orchestration-v2/EventSink.ts',
      'apps/server/src/orchestration-v2/EffectWorker.ts',
    ],
  }),
  lesson({
    slug: 'gtc-02-performance-budgets-as-tests',
    lesson: 2,
    title: 'Performance budgets belong in unit tests',
    subtitle:
      "Seven performance patterns from one repo's commit log, and why their budgets fail the build.",
    tag: 'Performance',
    readMinutes: 2,
    hints: [
      'Its maintainers list “performance without compromise” as a value they never trade away.',
      'Its users run AI agents all day, and the docs say they notice a single dropped frame.',
      'Its server is built on the Effect library.',
    ],
    sources: [
      'docs/internals/performance-regressions.md',
      'apps/server/src/orchestration-v2/ThreadTransportPerformance.test.ts',
      'oxlint-plugin-t3code/rules/no-unscoped-has.ts',
      'docs/internals/connection-runtime.md',
    ],
  }),
  lesson({
    slug: 'gtc-03-mock-the-boundary',
    lesson: 3,
    title: 'Mock the boundary, not the logic',
    subtitle:
      '“A test that needs a timeout to pass is wrong.” Testing rules from a repo that bans sleeps.',
    tag: 'Testing',
    readMinutes: 2,
    hints: [
      'It talks to six different AI coding agents through their own CLIs.',
      'Its pitch: “bring your own subscription”.',
      'Every agent turn ends with a hidden git ref so you can diff and restore.',
    ],
    sources: [
      'docs/orchestration-v2/testing-strategy.md',
      'packages/shared/src/DrainableWorker.ts',
      'apps/server/scripts/migrate-dev-db.ts',
      'oxlint-plugin-t3code/rules/no-test-in-loop.ts',
    ],
  }),
  lesson({
    slug: 'gtc-04-pr-process-for-the-ai-era',
    lesson: 4,
    title: 'A PR process for the AI era',
    subtitle:
      'When anyone can generate a 2,000-line PR in ten minutes, review time is what you protect.',
    tag: 'GitHub & PRs',
    readMinutes: 2,
    hints: [
      'One of its maintainers is a well-known tech YouTuber.',
      'Over a thousand commits on main carry AI co-author trailers.',
      'Its AI triage bot loads its rules from main, never from the PR.',
    ],
    sources: [
      'CONTRIBUTING.md',
      '.github/pull_request_template.md',
      '.github/workflows/pr-size.yml',
      '.github/workflows/mobile-fingerprint-check.yml',
      '.macroscope/check-run-agents/ui-consistency.md',
      '.macroscope/approvability.md',
    ],
  }),
  lesson({
    slug: 'gtc-05-taste-as-lint-rules',
    lesson: 5,
    title: 'Turn taste into lint rules',
    subtitle: "Review comments don't scale. A repo with 14 custom lint rules shows what does.",
    tag: 'DX & Tooling',
    readMinutes: 1,
    hints: [
      'It ships its own oxlint plugin.',
      'Its name is a letter followed by a number.',
      'Its desktop app wraps the web app in Electron.',
    ],
    sources: [
      'oxlint-plugin-t3code/rules/',
      'oxlint-plugin-t3code/rules/no-native-title-tooltip.ts',
      'oxlint-plugin-t3code/rules/require-suppression-reason.ts',
      'docs/internals/web-ui.md',
      'knip.jsonc',
    ],
  }),
  lesson({
    slug: 'gtc-06-dev-setup-for-parallel-agents',
    lesson: 6,
    title: 'A dev setup built for ten agents on one laptop',
    subtitle:
      'Ports, databases, processes and URLs: everything shared becomes a collision once agents run in parallel.',
    tag: 'Dev setup',
    readMinutes: 2,
    hints: [
      'Most of its contributions come from the app itself, controlled remotely.',
      'It creates a git worktree per task.',
      'You can install it with a three-character npx command.',
    ],
    sources: [
      'scripts/dev-runner.ts',
      'scripts/setup-worktree.ts',
      't3.json',
      'docs/operations/development.md',
      '.github/workflows/ci.yml',
    ],
  }),
  lesson({
    slug: 'gtc-07-honest-ui',
    lesson: 7,
    title: 'Lying spinners, stale labels, one-way doors',
    subtitle:
      'UX rules from a repo whose users stare at it all day and notice every lie the UI tells.',
    tag: 'UI / UX',
    readMinutes: 2,
    hints: [
      'It shows live status for agents running on other machines.',
      'It reconnects across LAN, Tailscale, SSH and its own tunnel.',
      'Its mobile app is React Native and shares a client runtime with the web app.',
    ],
    sources: [
      'docs/internals/connection-runtime.md',
      'AGENTS.md',
      'docs/internals/web-ui.md',
      'apps/web/src/components/chat/ComposerBanner.tsx',
    ],
  }),
  lesson({
    slug: 'gtc-08-write-docs-for-agents',
    lesson: 8,
    title: 'Write docs for your most frequent contributor',
    subtitle:
      'In this repo, the most frequent contributor is an AI agent running inside the app itself.',
    tag: 'AI-native engineering',
    readMinutes: 1,
    hints: [
      'Its agent guide opens with a note from the founder.',
      "It's a GUI for coding agents, and it's used to build itself.",
      "I've already written about it on this blog.",
    ],
    sources: ['AGENTS.md', 'docs/internals/glossary.md', 'CONTRIBUTING.md'],
  }),
]

export const finale: FinalePost = {
  kind: 'finale',
  slug: 'gtc-reveal-t3-code-power-user-tips',
  title: 'The reveal: it was T3 Code (plus 30 power-user tips)',
  description:
    "All eight #GuessTheCodebase lessons came from T3 Code. Here's the repo, plus 30 power-user tips for using it every day.",
  subtitle:
    "All eight lessons came from one open-source repo. Here it is, and here's how to get the most out of it.",
  date: SERIES_DATE,
  tag: 'Finale',
  readMinutes: 5,
  image: { path: '/assets/og/gtc-reveal.png', alt: 'Guess the codebase: the reveal. It was T3 Code.' },
  shareText:
    'The #GuessTheCodebase answer: it was T3 Code. 8 engineering lessons, plus 30 power-user tips:',
  // Kept out of the feed and sitemap so the answer doesn't leak before readers guess.
  indexed: false,
}

export const seriesIndex: SeriesIndexPost = {
  kind: 'series',
  slug: series.slug,
  title: 'Guess the codebase',
  description:
    'Eight engineering lessons from one open-source codebase, on architecture, performance, testing, PRs, tooling, dev setup, UX and AI-native docs. Guess which repo.',
  subtitle: 'Eight engineering lessons from one open-source repo. You guess which one.',
  date: SERIES_DATE,
  tag: 'Series',
  image: {
    path: '/assets/og/gtc-series.png',
    alt: 'Guess the codebase: 8 engineering lessons from one open-source repo',
  },
  shareText: '🕵️ #GuessTheCodebase: 8 engineering lessons from one open-source repo. Guess which one.',
  indexed: true,
  feed: {
    title: 'Guess the codebase: 8 engineering lessons from one open-source repo',
    summary: 'A series: eight engineering lessons from one open-source codebase. Guess which repo.',
  },
  listing: {
    tag: 'series',
    title: 'Guess the codebase',
    summary:
      'Eight engineering lessons from one open-source repo, on architecture, performance, testing, PRs and more. You guess which repo.',
  },
}

export const sshEncryptedEssay: GuidePost = {
  kind: 'guide',
  slug: 'ssh-is-encrypted-wrong-question',
  title: '"But SSH is encrypted": the wrong security question',
  heading: '"But SSH is encrypted" is the wrong security question',
  description:
    'A phone terminal over SSH vs. T3 Code: encryption is a tie, so the real differences are who can connect, what they can do, and how you take access back when a phone is lost.',
  subtitle: 'Encryption is a property of the pipe. Security is a property of the system.',
  date: '2026-10-09',
  tag: 'Security',
  readMinutes: 5,
  image: {
    path: '/assets/og/ssh-is-encrypted-wrong-question.png',
    alt: '"But SSH is encrypted": the wrong security question, by Tarek Kharsa',
  },
  shareText:
    '"SSH is encrypted" answers 1 of the 4 questions that matter for remote access. The other 3 are where the real differences are:',
  indexed: true,
  feed: {
    title: '"But SSH is encrypted": the wrong security question',
    summary:
      'Encryption is a tie between a phone SSH terminal and T3 Code. Authentication, authorization and revocation are where they differ.',
  },
  listing: {
    tag: 'security',
    title: '"But SSH is encrypted" is the wrong security question',
    summary:
      'A phone terminal over SSH vs. T3 Code: encryption is a tie, so the real differences are who can connect, what they can do, and how you take it back.',
  },
}

export const t3CodeServerGuide: GuidePost = {
  kind: 'guide',
  slug: 't3-code-tailscale-home-server',
  title: 'Turning my Linux PC into a T3 Code server',
  heading: 'How I Turned My Linux PC into a T3 Code Server I Can Use from Anywhere',
  headline: 'Turning my Linux PC into a T3 Code server (Tailscale)',
  description:
    'Run T3 Code on a Linux PC and reach it privately from your laptop and phone with Tailscale. A short, step-by-step guide.',
  subtitle: 'A short, step-by-step guide.',
  date: '2026-09-28',
  updated: '2026-10-09',
  tag: 'Guide',
  readMinutes: 3,
  image: {
    path: '/assets/og/t3-code-tailscale-home-server.png',
    alt: 'Turning my Linux PC into a T3 Code server — T3 Code + Tailscale guide by Tarek Kharsa',
  },
  shareText:
    'Turning a Linux PC into a T3 Code server you can reach from anywhere, with Tailscale:',
  indexed: true,
  feed: {
    title: 'Turning my Linux PC into a T3 Code server',
    summary:
      'Run T3 Code on a Linux PC and reach it privately from your laptop and phone with Tailscale. A short, step-by-step guide.',
  },
  listing: {
    tag: 'guide',
    title: 'Turning my Linux PC into a T3 Code server',
    summary:
      'Running T3 Code on a home PC and reaching it privately from a laptop and phone with Tailscale.',
  },
}

/** Series pages in reading order: lessons, then the finale. */
export const seriesPosts: SeriesPost[] = [...lessons, finale]

/** All posts, newest first. Posts sharing a date keep series order. */
export const posts: Post[] = [sshEncryptedEssay, seriesIndex, ...seriesPosts, t3CodeServerGuide]

export function findPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

export function postPath(post: Pick<Post, 'slug'>): string {
  return `/posts/${post.slug}.html`
}

export function postUrl(post: Pick<Post, 'slug'>): string {
  return absoluteUrl(postPath(post))
}

/** Hints from every lesson before this one. */
export function earlierHints(post: LessonPost): string[] {
  return lessons.filter((other) => other.lesson < post.lesson).flatMap((other) => other.hints)
}

export function seriesNeighbors(post: SeriesPost): { prev?: SeriesPost; next?: SeriesPost } {
  let index = seriesPosts.indexOf(post)
  return { prev: seriesPosts[index - 1], next: seriesPosts[index + 1] }
}

/** The last time a post changed: its update date, or its publication date. */
export function modifiedDate(post: Pick<Post, 'date' | 'updated'>): string {
  return post.updated ?? post.date
}

export function latestDate(): string {
  return posts.map(modifiedDate).sort().at(-1) ?? SERIES_DATE
}

const bodyCache = new Map<string, string>()

/** Reads the hand-written prose for a post from content/posts/<slug>.html. */
export function readPostBody(slug: string): string {
  let cached = bodyCache.get(slug)
  if (cached != null && process.env.NODE_ENV === 'production') return cached
  let body = fs.readFileSync(new URL(`../../content/posts/${slug}.html`, import.meta.url), 'utf8')
  bodyCache.set(slug, body)
  return body
}

export const author = {
  '@type': 'Person',
  name: site.name,
  url: absoluteUrl('/'),
} as const
