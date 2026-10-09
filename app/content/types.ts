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

/** The Guess the codebase hub: rules, and every round's lessons. */
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
  hints: [string, string, string]
  /** Paths in the answer repo, shown when the reader gives up. */
  sources: string[]
  /**
   * A prompt readers paste into their coding agent to apply the lesson to their own code.
   * It must not name the answer repo.
   */
  prompt: string
}

export interface FinalePost extends BasePost {
  kind: 'finale'
  round: number
  /** How the series pages refer to it, e.g. "The reveal + 30 power-user tips". */
  teaser: string
}

export type Post = GuidePost | SeriesIndexPost | LessonPost | FinalePost
export type SeriesPost = LessonPost | FinalePost

/** The open-source repo a round's lessons come from. */
export interface Answer {
  name: string
  /** owner/name on GitHub. */
  repo: string
  url: string
  /** Prefix for "where to look" links; lesson sources are appended to it. */
  blobBase: string
  /** Short description, used after the name: "T3 Code (pingdotgg/t3code), <blurb>." */
  blurb: string
}

/** One round of Guess the codebase: eight lessons from one repo, then the reveal. */
export interface Round {
  number: number
  answer: Answer
  /** Published on the hub before any lesson, vaguer than every lesson hint. */
  hintZero: string
  /** One or two sentences for the home page card while this is the latest round. */
  pitch: string
  lessons: LessonPost[]
  finale: FinalePost
}
