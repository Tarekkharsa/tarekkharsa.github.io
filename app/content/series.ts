import type { Answer, FinalePost, LessonPost, Round } from './types.ts'

export const series = {
  slug: 'guess-the-codebase',
  name: 'Guess the codebase',
  hashtag: '#GuessTheCodebase',
} as const

export const LESSONS_PER_ROUND = 8

export interface LessonInput {
  /** Must start with the round's slug prefix, e.g. gtc2-03-... */
  slug: string
  lesson: number
  title: string
  subtitle: string
  tag: string
  readMinutes: number
  hints: [string, string, string]
  sources: string[]
}

export interface RoundInput {
  number: number
  /** Publication date of every page in the round, YYYY-MM-DD. */
  date: string
  /** Lesson slugs and OG images start with this, e.g. gtc2 -> gtc2-01-..., gtc2-01.png. */
  slugPrefix: string
  answer: Answer
  hintZero: string
  pitch: string
  lessons: LessonInput[]
  finale: Omit<FinalePost, 'kind' | 'round' | 'date' | 'indexed'> & { indexed?: boolean }
}

/**
 * Builds a round's posts from the parts that differ per lesson. Descriptions, OG images,
 * share text and feed entries all follow from the round and lesson numbers.
 *
 * Round 1 shipped before there were rounds, so its text never mentions one: those pages,
 * images and tweets are already out there and stay as published.
 */
export function defineRound(input: RoundInput): Round {
  let { number, date, slugPrefix } = input
  let legacy = number === 1
  // "Lesson 3" in round 1, "Round 2, lesson 3" afterwards.
  let lessonLabel = (n: number) => (legacy ? `Lesson ${n}` : `Round ${number}, lesson ${n}`)

  if (input.lessons.length !== LESSONS_PER_ROUND) {
    throw new Error(`Round ${number} has ${input.lessons.length} lessons, expected ${LESSONS_PER_ROUND}`)
  }

  let lessons: LessonPost[] = input.lessons.map((lesson, index) => {
    let n = lesson.lesson
    if (n !== index + 1) throw new Error(`Round ${number}: lesson ${n} is in position ${index + 1}`)
    if (!lesson.slug.startsWith(`${slugPrefix}-0${n}-`)) {
      throw new Error(`Round ${number}: slug ${lesson.slug} must start with ${slugPrefix}-0${n}-`)
    }
    return {
      ...lesson,
      kind: 'lesson',
      round: number,
      description: `${lesson.subtitle} ${lessonLabel(n)} of ${LESSONS_PER_ROUND} in ${series.hashtag}: can you guess which open-source repo it came from?`,
      date,
      image: {
        path: `/assets/og/${slugPrefix}-0${n}.png`,
        alt: `Guess the codebase, ${legacy ? '' : `round ${number}, `}lesson ${n}: ${lesson.title}`,
      },
      shareText: `${lessonLabel(n)} of ${series.hashtag}: ${lesson.title}. Can you guess which open-source repo it came from?`,
      indexed: true,
      feed: {
        title: `Guess the codebase ${legacy ? '' : `round ${number} `}#${n}: ${lesson.title}`,
        summary: lesson.subtitle,
      },
    }
  })

  let finale: FinalePost = {
    ...input.finale,
    kind: 'finale',
    round: number,
    date,
    // Kept out of the feed and sitemap until reveal day, so the answer doesn't leak.
    indexed: input.finale.indexed ?? false,
  }

  return { number, answer: input.answer, hintZero: input.hintZero, pitch: input.pitch, lessons, finale }
}
