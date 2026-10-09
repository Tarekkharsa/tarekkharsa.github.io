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

/** The lessons hub: every codebase studied, with its lessons. */
export interface SeriesIndexPost extends BasePost {
  kind: 'series'
}

export interface LessonPost extends BasePost {
  kind: 'lesson'
  round: number
  lesson: number
  /** "In short" card: the problem, in one or two sentences. */
  problem: string
  /** "In short" card: the idea that fixes it, in one sentence. */
  idea: string
  /** Paths in the studied repo that back the lesson, listed under "Read the source". */
  sources: string[]
  /**
   * A prompt readers paste into their coding agent to apply the lesson to their own code.
   * It describes the idea, not the studied repo, so it works in any codebase.
   */
  prompt: string
}

/** The last page of a round: power-user tips for the codebase the lessons came from. */
export interface FinalePost extends BasePost {
  kind: 'finale'
  round: number
  /** How the series pages refer to it, e.g. "30 power-user tips". */
  teaser: string
}

export type Post = GuidePost | SeriesIndexPost | LessonPost | FinalePost
export type SeriesPost = LessonPost | FinalePost

/** The open-source repo a round's lessons come from. */
export interface Codebase {
  name: string
  /** owner/name on GitHub. */
  repo: string
  url: string
  /** Prefix for "Read the source" links; lesson sources are appended to it. */
  blobBase: string
  /** Short description, used after the name: "T3 Code (pingdotgg/t3code), <blurb>." */
  blurb: string
}

/** One round: eight lessons from one codebase, then power-user tips for it. */
export interface Round {
  number: number
  codebase: Codebase
  /** One or two sentences on what the round's lessons cover, for the home and hub pages. */
  pitch: string
  lessons: LessonPost[]
  finale: FinalePost
}
