import * as fs from 'node:fs'

import { absoluteUrl, site } from '../site.ts'
import { highlightCodeBlocks } from './highlight.ts'
import { opencodeRound } from './rounds/opencode.ts'
import { piRound } from './rounds/pi.ts'
import { t3codeRound } from './rounds/t3code.ts'
import { series } from './series.ts'
import type { GuidePost, Post, Round, SeriesIndexPost, SeriesPost } from './types.ts'

export { LESSONS_PER_ROUND, series } from './series.ts'
export type * from './types.ts'

/**
 * Every page under /posts/ is registered here. The prose body of each post lives in
 * content/posts/<slug>.html; everything around it (head tags, series navigation, source links,
 * pager, share buttons, feed and sitemap entries) is generated from this metadata.
 *
 * Each round of lessons lives in ./rounds/, one file per codebase.
 */

/** Newest first. */
export const rounds: Round[] = [opencodeRound, piRound, t3codeRound]

export const seriesIndex: SeriesIndexPost = {
  kind: 'series',
  slug: series.slug,
  title: series.name,
  description:
    'Engineering lessons from reading great open-source codebases cover to cover: architecture, performance, testing, PRs, tooling and docs for AI agents, each verified in the source and linked to it.',
  subtitle:
    'I read one open-source codebase cover to cover, then write up eight things it does better than most. Every claim links to the code.',
  date: '2026-10-09',
  tag: 'Series',
  image: {
    path: '/assets/og/gtc-series.png',
    alt: 'Lessons from great codebases: engineering lessons from open-source repos, 8 per codebase',
  },
  shareText:
    'Engineering lessons from great open-source codebases, 8 per repo, every claim linked to the source:',
  indexed: true,
  feed: {
    title: 'Lessons from great codebases',
    summary: 'Eight engineering lessons per open-source codebase, each verified in the source and linked to it.',
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

export const effectGraphqlGuide: GuidePost = {
  kind: 'guide',
  slug: 'gql-tada-to-effect-graphql',
  title: 'Moving from gql.tada to effect/graphql',
  heading: 'Why We Moved Our GraphQL Client from gql.tada to effect/graphql',
  description:
    'Why a TanStack Start app on Effect 4 replaced gql.tada and a hand-written client with effect/graphql: decoded results, typed errors, middleware, a test transport and batching, moved in four steps.',
  subtitle: 'Why we switched, what we got, and how we moved without breaking the app.',
  date: '2026-10-14',
  tag: 'Effect',
  readMinutes: 8,
  image: {
    path: '/assets/og/gql-tada-to-effect-graphql.png',
    alt: 'Moving from gql.tada to effect/graphql, by Tarek Kharsa',
  },
  shareText: 'Why we moved our GraphQL client from gql.tada to effect/graphql, and how:',
  indexed: true,
  feed: {
    title: 'Moving from gql.tada to effect/graphql',
    summary:
      'Decoded results, typed errors, middleware, a test transport and batching: why we moved off gql.tada, and how we did it in four steps.',
  },
  listing: {
    tag: 'effect',
    title: 'Moving from gql.tada to effect/graphql',
    summary: 'Why we replaced gql.tada and a hand-written client with effect/graphql, and how we moved in four steps.',
  },
}

/** A round's pages in reading order: its lessons, then the finale. */
export function roundPosts(round: Round): SeriesPost[] {
  return [...round.lessons, round.finale]
}

/** All posts, newest first. Posts sharing a date keep series order. */
export const posts: Post[] = [effectGraphqlGuide, seriesIndex, ...rounds.flatMap(roundPosts), t3CodeServerGuide]

export function roundOf(post: SeriesPost): Round {
  let round = rounds.find((candidate) => candidate.number === post.round)
  if (round == null) throw new Error(`${post.slug} belongs to unknown round ${post.round}`)
  return round
}

/**
 * Lessons replaced after they were published, old slug -> new slug. The old URL keeps
 * working as a small page that forwards to the replacement.
 */
export const movedPosts: Record<string, string> = {
  'gtc2-04-closed-by-default': 'gtc2-04-never-mutate-history',
  'gtc2-06-many-agents-one-checkout': 'gtc2-06-tool-a-model-cant-misuse',
  'gtc3-04-lab-notebook-for-speed': 'gtc3-04-bound-what-the-model-sees',
  'gtc3-08-ban-the-synonyms': 'gtc3-08-compact-before-you-overflow',
}

export function findPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

export function postPath(post: Pick<Post, 'slug'>): string {
  return `/posts/${post.slug}`
}

export function postUrl(post: Pick<Post, 'slug'>): string {
  return absoluteUrl(postPath(post))
}

export function seriesNeighbors(post: SeriesPost): { prev?: SeriesPost; next?: SeriesPost } {
  let pages = roundPosts(roundOf(post))
  let index = pages.indexOf(post)
  return { prev: pages[index - 1], next: pages[index + 1] }
}

/** The last time a post changed: its update date, or its publication date. */
export function modifiedDate(post: Pick<Post, 'date' | 'updated'>): string {
  return post.updated ?? post.date
}

export function latestDate(): string {
  return posts.map(modifiedDate).sort().at(-1) ?? seriesIndex.date
}

const bodyCache = new Map<string, string>()

/** Reads the hand-written prose for a post from content/posts/<slug>.html. */
export function readPostBody(slug: string): string {
  let cached = bodyCache.get(slug)
  if (cached != null && process.env.NODE_ENV === 'production') return cached
  let body = highlightCodeBlocks(
    fs.readFileSync(new URL(`../../content/posts/${slug}.html`, import.meta.url), 'utf8'),
  )
  bodyCache.set(slug, body)
  return body
}

export const author = {
  '@type': 'Person',
  name: site.name,
  url: absoluteUrl('/'),
} as const
